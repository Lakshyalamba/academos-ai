import "server-only";

import {
  askGeminiWithSchema,
  parseGeminiJsonResponse,
} from "./gemini";
import { isValidContestDraft } from "./contest-draft";
import { getNewtonSnapshot } from "./newton-mcp";

const CONTEST_GUIDANCE_SCHEMA = {
  type: "OBJECT",
  properties: {
    summary: {
      type: "STRING",
    },
    focusTopics: {
      type: "ARRAY",
      items: {
        type: "STRING",
      },
    },
    reviseClasses: {
      type: "ARRAY",
      items: {
        type: "STRING",
      },
    },
    actionItems: {
      type: "ARRAY",
      items: {
        type: "STRING",
      },
    },
    insights: {
      type: "ARRAY",
      items: {
        type: "STRING",
      },
    },
  },
};

function normalizeList(value) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }

  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : String(item || "").trim()))
    .filter(Boolean);
}

function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeSubjectKey(value) {
  const normalized = normalizeSearchText(value)
    .replace(/\b(?:lab|tut|tutorial|practical|class)\b/g, " ")
    .replace(/\b(?:pm|am)\b/g, " ")
    .replace(/\bcb\d+\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return normalized;
}

function isSubjectMatch(entrySubject, contestSubject) {
  const entryKey = normalizeSubjectKey(entrySubject);
  const contestKey = normalizeSubjectKey(contestSubject);

  if (!entryKey || !contestKey) {
    return false;
  }

  return (
    entryKey === contestKey ||
    entryKey.includes(contestKey) ||
    contestKey.includes(entryKey)
  );
}

function getTextTimestamp(value) {
  if (!value) {
    return Number.NaN;
  }

  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : Number.NaN;
}

function truncateText(value, maxLength = 88) {
  const text = String(value || "").trim();

  if (!text || text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 3).trimEnd()}...`;
}

function formatProgressSummary(performance) {
  if (!performance) {
    return null;
  }

  const parts = [];

  if (
    typeof performance.lectures_attended === "number" &&
    typeof performance.total_lectures === "number" &&
    performance.total_lectures > 0
  ) {
    const attendance = (performance.lectures_attended / performance.total_lectures) * 100;
    parts.push(`Attendance ${attendance.toFixed(1)}%`);
  }

  if (
    typeof performance.completed_assignment_questions === "number" &&
    typeof performance.total_assignment_questions === "number" &&
    performance.total_assignment_questions > 0
  ) {
    parts.push(
      `Assignments ${performance.completed_assignment_questions}/${performance.total_assignment_questions}`,
    );
  }

  if (
    typeof performance.completed_assessments === "number" &&
    typeof performance.total_assessments === "number" &&
    performance.total_assessments > 0
  ) {
    parts.push(
      `Assessments ${performance.completed_assessments}/${performance.total_assessments}`,
    );
  }

  return parts.length ? parts.join(" | ") : null;
}

function buildLectureLabel(lecture) {
  const title = lecture?.title || lecture?.subjectName || "Lecture";
  const startsAt = lecture?.startsAt ? ` on ${lecture.startsAt}` : "";
  return `${truncateText(title, 72)}${startsAt}`;
}

function buildTopicCoverage(topics, context) {
  const searchableEntries = [
    ...(context.pendingAssignments || []).map((item) => ({
      kind: "assignment",
      label: item.title,
      haystack: normalizeSearchText(`${item.title} ${item.subjectName || ""}`),
    })),
    ...(context.recentLectures || []).map((item) => ({
      kind: "recent-lecture",
      label: item.title || item.subjectName,
      haystack: normalizeSearchText(
        `${item.title || ""} ${item.subjectName || ""} ${item.startsAt || ""}`,
      ),
    })),
    ...(context.upcomingLectures || []).map((item) => ({
      kind: "upcoming-lecture",
      label: item.subjectName,
      haystack: normalizeSearchText(
        `${item.subjectName || ""} ${item.type || ""} ${item.startsAt || ""}`,
      ),
    })),
  ];

  return topics.map((topic) => {
    const normalizedTopic = normalizeSearchText(topic);
    const normalizedTokens = normalizedTopic.split(" ").filter((token) => token.length >= 4);
    const matches = searchableEntries.filter((entry) => {
      if (!normalizedTopic) {
        return false;
      }

      if (entry.haystack.includes(normalizedTopic)) {
        return true;
      }

      if (normalizedTokens.length === 0) {
        return false;
      }

      return normalizedTokens.some((token) => entry.haystack.includes(token));
    });

    return {
      topic,
      evidenceCount: matches.length,
      lectureMatches: matches
        .filter((match) => match.kind.includes("lecture"))
        .slice(0, 3)
        .map((match) => match.label),
      assignmentMatches: matches
        .filter((match) => match.kind === "assignment")
        .slice(0, 3)
        .map((match) => match.label),
    };
  });
}

function normalizeContestAssignments(snapshot, contestSubject) {
  const assignments = Array.isArray(snapshot?.assignments?.assignments)
    ? snapshot.assignments.assignments
    : [];

  return assignments
    .filter((item) => isSubjectMatch(item?.subjectName, contestSubject))
    .sort((left, right) => {
      const leftTimestamp = getTextTimestamp(left?.dueTimestamp);
      const rightTimestamp = getTextTimestamp(right?.dueTimestamp);

      if (Number.isFinite(leftTimestamp) && Number.isFinite(rightTimestamp)) {
        return leftTimestamp - rightTimestamp;
      }

      if (Number.isFinite(leftTimestamp)) {
        return -1;
      }

      if (Number.isFinite(rightTimestamp)) {
        return 1;
      }

      return String(left?.title || "").localeCompare(String(right?.title || ""));
    })
    .slice(0, 6)
    .map((item) => ({
      title: item?.title || "Untitled assignment",
      subjectName: item?.subjectName || contestSubject,
      dueAt: item?.dueAt || null,
      dueTimestamp: item?.dueTimestamp || null,
      totalQuestions: item?.totalQuestions ?? null,
    }));
}

function normalizeUpcomingLectures(snapshot, contestSubject) {
  const lectures = Array.isArray(snapshot?.schedule?.upcomingLectures)
    ? snapshot.schedule.upcomingLectures
    : [];

  return lectures
    .filter((item) => isSubjectMatch(item?.subjectName, contestSubject))
    .slice(0, 6)
    .map((item) => ({
      subjectName: item?.subjectName || contestSubject,
      startsAt: item?.startsAt || null,
      startTimestamp: item?.startTimestamp || null,
      type: item?.type || null,
    }));
}

function normalizeRecentLectures(snapshot, contestSubject) {
  const lectures = Array.isArray(snapshot?.recentLectures?.lectures)
    ? snapshot.recentLectures.lectures
    : [];

  return lectures
    .filter((item) => isSubjectMatch(item?.subjectName, contestSubject))
    .slice(0, 6)
    .map((item) => ({
      title: item?.title || null,
      subjectName: item?.subjectName || contestSubject,
      startsAt: item?.startsAt || null,
      startTimestamp: item?.startTimestamp || null,
      hasRecording: Boolean(item?.hasRecording),
      isAttended: Boolean(item?.isAttended),
      isWatched: Boolean(item?.isWatched),
    }));
}

function pickSubjectProgress(...snapshots) {
  for (const snapshot of snapshots) {
    const entries = Array.isArray(snapshot?.subjectProgresses) ? snapshot.subjectProgresses : [];
    const entry = entries[0];

    if (entry?.performance) {
      return {
        subjectName: entry.subjectName || snapshot?.context?.subject?.subjectName || null,
        performance: entry.performance,
      };
    }
  }

  return null;
}

function hasUsefulAcademicContext(context) {
  return Boolean(
    context.subjectProgress?.performance ||
      context.pendingAssignments.length > 0 ||
      context.upcomingLectures.length > 0 ||
      context.recentLectures.length > 0,
  );
}

async function buildContestGuidanceContext(contest) {
  const subjectName = contest.subjectName.trim();
  const academicSnapshot = await getNewtonSnapshot(
    `What should I focus on today for ${subjectName}?`,
  );
  const timelineSnapshot = await getNewtonSnapshot(
    `Show recent lectures and missed lectures for ${subjectName}.`,
  );

  const pendingAssignments = normalizeContestAssignments(academicSnapshot, subjectName);
  const upcomingLectures = normalizeUpcomingLectures(academicSnapshot, subjectName);
  const recentLectures = normalizeRecentLectures(timelineSnapshot, subjectName);
  const missedLectures = recentLectures.filter(
    (lecture) => lecture.isAttended === false && lecture.isWatched === false,
  );
  const subjectProgress = pickSubjectProgress(academicSnapshot, timelineSnapshot);
  const topicCoverage = buildTopicCoverage(contest.syllabus.topics, {
    pendingAssignments,
    recentLectures,
    upcomingLectures,
  });

  return {
    contest: {
      contestName: contest.contestName,
      contestDate: contest.contestDate,
      subjectName,
      syllabus: {
        rawInput: contest.syllabus.rawInput,
        topics: contest.syllabus.topics,
      },
      notes: contest.notes,
    },
    matchedSubjectName:
      subjectProgress?.subjectName ||
      academicSnapshot?.context?.subject?.subjectName ||
      timelineSnapshot?.context?.subject?.subjectName ||
      subjectName,
    subjectProgress,
    progressSummary: formatProgressSummary(subjectProgress?.performance),
    pendingAssignments,
    upcomingLectures,
    recentLectures,
    missedLectures,
    topicCoverage,
    hasAcademicContext: hasUsefulAcademicContext({
      subjectProgress,
      pendingAssignments,
      upcomingLectures,
      recentLectures,
    }),
  };
}

function buildContestGuidancePrompt(context) {
  return [
    "You are a JSON-only contest preparation assistant for students.",
    "The student manually entered an upcoming contest.",
    "The backend fetched Newton academic data for the same subject before this reasoning step.",
    "Use ONLY the provided contest input and academic context below.",
    "Do NOT invent lectures, weak topics, deadlines, class notes, or progress signals.",
    "Compare the contest topics against recent lectures, missed lectures, upcoming classes, subject progress, and pending assignments.",
    "Only call a topic weak or undercovered when the provided data suggests backlog, missing coverage, missed lectures, or thin recent evidence.",
    "reviseClasses must reference concrete lectures or classes from the provided academic context.",
    "actionItems must be short, concrete, and prioritized for the student before the contest.",
    "If evidence is limited, say that clearly in the summary and keep unsupported sections short or empty.",
    "Respond with ONLY valid JSON using exactly this shape:",
    "{\"summary\":\"\",\"focusTopics\":[],\"reviseClasses\":[],\"actionItems\":[],\"insights\":[]}",
    "",
    "Contest and academic context:",
    JSON.stringify(context, null, 2),
  ].join("\n");
}

function normalizeContestGuidance(value) {
  return {
    summary: typeof value?.summary === "string" ? value.summary.trim() : "",
    focusTopics: normalizeList(value?.focusTopics).slice(0, 5),
    reviseClasses: normalizeList(value?.reviseClasses).slice(0, 5),
    actionItems: normalizeList(value?.actionItems).slice(0, 5),
    insights: normalizeList(value?.insights).slice(0, 5),
  };
}

function buildFallbackContestGuidance(context, summaryOverride = "") {
  const reviseClasses = [
    ...context.missedLectures.map((lecture) =>
      lecture.hasRecording
        ? `Review the recording for ${buildLectureLabel(lecture)}.`
        : `Review notes from ${buildLectureLabel(lecture)}.`,
    ),
    ...context.recentLectures
      .filter((lecture) => lecture.hasRecording)
      .map((lecture) => `Replay ${buildLectureLabel(lecture)}.`),
  ]
    .filter(Boolean)
    .slice(0, 4);

  const actionItems = [
    ...context.pendingAssignments.map((assignment) =>
      `Finish ${truncateText(assignment.title, 64)}${assignment.dueAt ? ` before ${assignment.dueAt}` : ""}.`,
    ),
    context.upcomingLectures[0]
      ? `Revise before ${context.upcomingLectures[0].subjectName} on ${context.upcomingLectures[0].startsAt}.`
      : "",
    context.contest.syllabus.topics[0]
      ? `Review ${context.contest.syllabus.topics[0]} before the contest.`
      : "",
  ]
    .filter(Boolean)
    .slice(0, 5);

  const focusTopics = context.topicCoverage
    .filter((topic) => topic.assignmentMatches.length > 0 || topic.lectureMatches.length > 0)
    .map((topic) => {
      const evidence =
        topic.assignmentMatches[0] || topic.lectureMatches[0] || "recent academic activity";
      return `Revisit ${topic.topic} through ${truncateText(evidence, 64)}.`;
    })
    .slice(0, 4);

  const insights = [
    context.progressSummary ? `${context.matchedSubjectName}: ${context.progressSummary}.` : "",
    context.missedLectures.length > 0
      ? `${context.missedLectures.length} recent lecture${context.missedLectures.length === 1 ? "" : "s"} still need catching up.`
      : "",
    context.pendingAssignments.length > 0
      ? `${context.pendingAssignments.length} pending assignment${context.pendingAssignments.length === 1 ? "" : "s"} are still open in this subject.`
      : "",
  ]
    .filter(Boolean)
    .slice(0, 4);

  return {
    summary:
      summaryOverride ||
      (context.hasAcademicContext
        ? `Prep guidance is based on your live ${context.matchedSubjectName} lectures, progress, and pending work.`
        : "Live subject-specific academic data is too limited right now to generate safe contest prep guidance."),
    focusTopics,
    reviseClasses,
    actionItems,
    insights,
  };
}

export async function generateContestGuidance(contestDraft) {
  if (!isValidContestDraft(contestDraft)) {
    throw new Error("A valid saved contest is required to generate prep guidance.");
  }

  const context = await buildContestGuidanceContext(contestDraft);

  if (!context.hasAcademicContext) {
    return {
      ...buildFallbackContestGuidance(
        context,
        "Live academic data for this subject is limited, so safe contest prep guidance could not be generated yet.",
      ),
      source: "fallback",
    };
  }

  try {
    const response = await askGeminiWithSchema(buildContestGuidancePrompt(context), {
      responseSchema: CONTEST_GUIDANCE_SCHEMA,
      temperature: 0.2,
      maxOutputTokens: 1200,
    });
    const parsedResponse = parseGeminiJsonResponse(response);
    const normalizedResponse = normalizeContestGuidance(parsedResponse);

    if (
      !normalizedResponse.summary &&
      normalizedResponse.focusTopics.length === 0 &&
      normalizedResponse.reviseClasses.length === 0 &&
      normalizedResponse.actionItems.length === 0 &&
      normalizedResponse.insights.length === 0
    ) {
      return {
        ...buildFallbackContestGuidance(
          context,
          "Live academic evidence was found, but the prep guidance format was unavailable right now.",
        ),
        source: "fallback",
      };
    }

    return {
      ...normalizedResponse,
      source: "gemini",
    };
  } catch {
    return {
      ...buildFallbackContestGuidance(
        context,
        "AI prep guidance is unavailable right now, so showing safe prep signals from your live academic data instead.",
      ),
      source: "fallback",
    };
  }
}
