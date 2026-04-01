import {
  askGemini,
  getConfiguredGeminiModel,
  parseGeminiJsonResponse,
} from "../../../lib/gemini";
import {
  buildAcademicReasoningPrompt,
  getNewtonSnapshot,
} from "../../../lib/newton-mcp";
import {
  getAcademicSnapshotById,
  insertAcademicSnapshot,
  isSupabaseConfigured,
  updateAcademicSnapshotReasoning,
} from "../../../lib/supabase";
import { getRuntimeStatus } from "../../../lib/runtime-status";

export const runtime = "nodejs";

function normalizeList(value) {
  if (typeof value === "string") {
    const trimmed = value.trim();

    return trimmed ? [trimmed] : [];
  }

  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }

      return String(item).trim();
    })
    .filter(Boolean);
}

function buildGeminiFallbackResponse() {
  return {
    summary:
      "I couldn't format Gemini's response as structured academic data. Please try again.",
    tasks: [],
    insights: [],
  };
}

function normalizeAcademicResponse(value) {
  return {
    summary:
      typeof value?.summary === "string" ? value.summary.trim() : "",
    tasks: normalizeList(value?.tasks),
    insights: normalizeList(value?.insights),
  };
}

function getScopeLabel(snapshot) {
  return (
    snapshot?.context?.subject?.subjectName ||
    snapshot?.context?.course?.semesterName ||
    snapshot?.context?.course?.courseTitle ||
    "your course"
  );
}

function formatCountLabel(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function isPastTimestamp(value) {
  if (!value) {
    return false;
  }

  const timestamp = new Date(value).getTime();

  return Number.isFinite(timestamp) && timestamp < Date.now();
}

function buildFallbackInsights(snapshot) {
  const insights = [];
  const scope = getScopeLabel(snapshot);
  const assignments = Array.isArray(snapshot?.assignments?.assignments)
    ? snapshot.assignments.assignments
    : [];
  const upcomingLectures = Array.isArray(snapshot?.schedule?.upcomingLectures)
    ? snapshot.schedule.upcomingLectures
    : [];
  const overdueAssignments = assignments.filter((assignment) =>
    isPastTimestamp(assignment?.dueTimestamp),
  );

  if (assignments.length > 0) {
    insights.push(
      `${formatCountLabel(assignments.length, "pending assignment is", "pending assignments are")} currently open in ${scope}.`,
    );
  }

  if (overdueAssignments.length > 0) {
    insights.push(
      `${formatCountLabel(overdueAssignments.length, "assignment appears overdue", "assignments appear overdue")} and may need immediate attention.`,
    );
  }

  if (upcomingLectures.length >= 3) {
    insights.push(
      `${formatCountLabel(upcomingLectures.length, "lecture is", "lectures are")} scheduled soon, so your workload is concentrated in the next 7 days.`,
    );
  } else if (upcomingLectures[0]?.startsAt) {
    insights.push(`Your next lecture in ${scope} is on ${upcomingLectures[0].startsAt}.`);
  }

  const attendance = snapshot?.attendance;

  if (
    attendance?.available &&
    typeof attendance.attendedLectures === "number" &&
    typeof attendance.totalLectures === "number" &&
    attendance.totalLectures > 0
  ) {
    const attendanceRate =
      (attendance.attendedLectures / attendance.totalLectures) * 100;

    if (attendanceRate < 75) {
      insights.push(
        `Attendance is below 75% in ${scope}, which is a weak signal you should correct quickly.`,
      );
    } else if (attendanceRate < 90) {
      insights.push(
        `Attendance in ${scope} is moderate, so a few missed lectures could noticeably lower your standing.`,
      );
    }
  }

  const performance = snapshot?.overview?.performance;

  if (
    typeof performance?.completed_assignment_questions === "number" &&
    typeof performance?.total_assignment_questions === "number" &&
    performance.total_assignment_questions > 0
  ) {
    const completionRate =
      performance.completed_assignment_questions /
      performance.total_assignment_questions;

    if (completionRate < 0.5) {
      insights.push("Assignment completion is still below halfway, so backlog pressure is building.");
    }
  }

  const subjectProgresses = Array.isArray(snapshot?.subjectProgresses)
    ? snapshot.subjectProgresses
    : [];
  const weakSubject = subjectProgresses.find((entry) => {
    const subjectPerformance = entry?.performance;

    if (
      typeof subjectPerformance?.lectures_attended === "number" &&
      typeof subjectPerformance?.total_lectures === "number" &&
      subjectPerformance.total_lectures > 0 &&
      subjectPerformance.lectures_attended / subjectPerformance.total_lectures < 0.75
    ) {
      return true;
    }

    if (
      typeof subjectPerformance?.completed_assignment_questions === "number" &&
      typeof subjectPerformance?.total_assignment_questions === "number" &&
      subjectPerformance.total_assignment_questions > 0 &&
      subjectPerformance.completed_assignment_questions /
        subjectPerformance.total_assignment_questions <
        0.5
    ) {
      return true;
    }

    return false;
  });

  if (weakSubject?.subjectName) {
    insights.push(`${weakSubject.subjectName} shows weaker progress signals than the rest of your current scope.`);
  }

  return [...new Set(insights)].slice(0, 4);
}

function hasUsefulAcademicData(snapshot) {
  return Boolean(
    snapshot?.attendance?.available ||
      (snapshot?.assignments?.assignments || []).length > 0 ||
      (snapshot?.schedule?.upcomingLectures || []).length > 0 ||
      (snapshot?.subjectProgresses || []).length > 0 ||
      snapshot?.overview?.performance,
  );
}

function logGeminiParsingFailure(reason, response) {
  console.error(reason, {
    responsePreview: String(response || "").slice(0, 1200),
  });
}

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  try {
    const rawQuery = body?.query;

    if (typeof rawQuery !== "string" || !rawQuery.trim()) {
      return Response.json(
        { error: "Request body must include a non-empty string 'query'." },
        { status: 400 },
      );
    }

    const query = rawQuery.trim();
    const runtimeStatus = getRuntimeStatus();

    if (runtimeStatus.status !== "ok") {
      return Response.json(
        {
          error: runtimeStatus.message,
          status: runtimeStatus.status,
          config: runtimeStatus.config,
          missing: runtimeStatus.missing,
          commands: runtimeStatus.commands,
        },
        { status: 503 },
      );
    }

    const snapshot = await getNewtonSnapshot(query);
    let persistedSnapshot = null;
    let snapshotId = "";
    let responseSource = "gemini";

    if (isSupabaseConfigured()) {
      try {
        const storedSnapshot = await insertAcademicSnapshot({
          query,
          intent: snapshot.intent,
          source: snapshot.source,
          toolsUsed: snapshot.toolsUsed,
          snapshot,
        });

        persistedSnapshot = await getAcademicSnapshotById(storedSnapshot.id);
        snapshotId = persistedSnapshot.id;
        responseSource = "supabase-gemini";
      } catch (error) {
        console.error("Supabase persistence is unavailable. Continuing with in-memory reasoning.", error);
      }
    }

    const response = await askGemini(
      buildAcademicReasoningPrompt(
        query,
        persistedSnapshot ? { snapshotRecord: persistedSnapshot } : { snapshot },
      ),
    );
    const parsedResponse = parseGeminiJsonResponse(response);

    if (
      parsedResponse &&
      typeof parsedResponse === "object" &&
      !Array.isArray(parsedResponse) &&
      typeof parsedResponse.error === "string" &&
      parsedResponse.error.trim()
    ) {
      if (persistedSnapshot) {
        try {
          await updateAcademicSnapshotReasoning(persistedSnapshot.id, {
            reasoningResponse: {
              error: parsedResponse.error.trim(),
            },
            reasoningModel: getConfiguredGeminiModel(),
          });
        } catch (error) {
          console.error("Unable to persist Gemini error response to Supabase.", error);
        }
      }

      return Response.json({ error: parsedResponse.error.trim() }, { status: 500 });
    }

    let normalizedResponse;

    if (!parsedResponse || typeof parsedResponse !== "object" || Array.isArray(parsedResponse)) {
      logGeminiParsingFailure("Gemini returned non-JSON or unparseable output.", response);
      normalizedResponse = buildGeminiFallbackResponse();
    } else {
      normalizedResponse = normalizeAcademicResponse(parsedResponse);

      if (
        !normalizedResponse.summary &&
        normalizedResponse.tasks.length === 0 &&
        normalizedResponse.insights.length === 0
      ) {
        logGeminiParsingFailure("Gemini returned a JSON payload without expected academic fields.", response);
        normalizedResponse = buildGeminiFallbackResponse();
      }
    }

    if (hasUsefulAcademicData(snapshot) && normalizedResponse.insights.length < 2) {
      const fallbackInsights = buildFallbackInsights(snapshot);

      normalizedResponse = {
        ...normalizedResponse,
        insights: [...new Set([...normalizedResponse.insights, ...fallbackInsights])].slice(0, 4),
      };
    }

    if (persistedSnapshot) {
      try {
        await updateAcademicSnapshotReasoning(persistedSnapshot.id, {
          reasoningResponse: normalizedResponse,
          reasoningModel: getConfiguredGeminiModel(),
        });
      } catch (error) {
        console.error("Unable to persist Gemini reasoning response to Supabase.", error);
      }
    }

    return Response.json({
      ...normalizedResponse,
      source: responseSource,
      snapshotId,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to process request.";

    return Response.json({ error: message }, { status: 500 });
  }
}
