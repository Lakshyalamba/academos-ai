import "server-only";

import {
  isGeminiConfigured,
  askGeminiWithSchema,
  parseGeminiJsonResponse,
} from "./gemini";
import { isValidContestDraft } from "./contest-draft";
import { LIVE_SYNC_DEMO_NOTICE } from "./demo-mode";
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

const CONTEST_QUERY_PATTERN =
  /(?:\bprepare\b|\bfocus\b|\brevise\b|\btopics?\b|\bsyllabus\b|\bnext\b|\bupcoming\b|\bfriday\b).*\bcontest\b|\bcontest\b.*(?:\bprepare\b|\bfocus\b|\brevise\b|\btopics?\b|\bsyllabus\b|\bnext\b|\bupcoming\b|\bfriday\b)|this friday'?s contest|next contest/i;

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

function uniqueItems(items) {
  return [...new Set(items.filter(Boolean))];
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

export function isContestRelatedQuery(query) {
  return CONTEST_QUERY_PATTERN.test(String(query || "").trim());
}

export function buildMissingContestChatResponse() {
  return {
    summary:
      "No upcoming contest is saved yet. Add your next contest on the Contest page first.",
    tasks: [
      "Open the Contest page and save the contest name, date, subject, and syllabus topics.",
    ],
    insights: [],
    source: "contest-missing",
    mode: "demo",
    notice: "",
    snapshotId: "",
  };
}

export function buildContestChatResponse(guidance) {
  const tasks = uniqueItems([
    ...(Array.isArray(guidance?.actionItems) ? guidance.actionItems : []),
    ...(Array.isArray(guidance?.reviseClasses) ? guidance.reviseClasses : []),
    ...(Array.isArray(guidance?.focusTopics)
      ? guidance.focusTopics.map((item) =>
          /^focus on|^review|^revise|^prepare/i.test(item)
            ? item
            : `Focus on ${item}`,
        )
      : []),
  ]).slice(0, 5);

  return {
    summary:
      typeof guidance?.summary === "string" && guidance.summary.trim()
        ? guidance.summary.trim()
        : "Contest prep guidance is ready from your saved contest and live academic data.",
    tasks,
    insights: normalizeList(guidance?.insights).slice(0, 4),
    source:
      guidance?.source === "gemini"
        ? "contest-gemini"
        : guidance?.source === "demo-gemini"
          ? "contest-demo-gemini"
          : guidance?.source === "demo-fallback"
            ? "contest-demo-fallback"
            : "contest-fallback",
    mode: guidance?.source === "gemini" || guidance?.source === "fallback" ? "live" : "demo",
    notice: typeof guidance?.notice === "string" ? guidance.notice : "",
    snapshotId: "",
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

function buildContestOnlyFallbackGuidance(contestDraft, summaryOverride = "") {
  const subjectName = contestDraft.subjectName.trim();
  const topics = Array.isArray(contestDraft?.syllabus?.topics)
    ? contestDraft.syllabus.topics
    : [];
  const notes = String(contestDraft?.notes || "").trim();

  return {
    summary:
      summaryOverride ||
      "Live academic sync is unavailable in this deployment, so this contest prep guidance is based on your saved contest details only.",
    focusTopics: topics.slice(0, 4).map((topic) => `Revise ${topic} with one concrete example or problem set.`),
    reviseClasses: [],
    actionItems: [
      contestDraft.contestDate
        ? `Split revision for ${subjectName} into short blocks before ${contestDraft.contestDate}.`
        : `Split revision for ${subjectName} into short blocks before the contest.`,
      topics[0] ? `Start with ${topics[0]} before moving to broader revision.` : "",
      notes ? "Use your saved notes to decide what still needs one final pass." : "",
    ].filter(Boolean),
    insights: [
      LIVE_SYNC_DEMO_NOTICE,
      notes
        ? "Your saved contest notes are available, but no live academic comparison is being used."
        : "No live lectures, assignments, or attendance signals are being used in this prep view.",
    ].filter(Boolean),
    notice: LIVE_SYNC_DEMO_NOTICE,
  };
}

function buildContestOnlyPrompt(contestDraft) {
  return [
    "You are a JSON-only contest preparation assistant for students.",
    "Live Newton academic data is unavailable in this deployment.",
    "Use ONLY the saved contest details below and general study-planning reasoning.",
    "Do NOT claim that live lectures, assignments, attendance, or progress were checked.",
    "Be explicit in the summary that this is fallback guidance.",
    "Keep action items short, concrete, and safe.",
    "If evidence is limited, leave reviseClasses empty rather than inventing live class references.",
    "Respond with ONLY valid JSON using exactly this shape:",
    "{\"summary\":\"\",\"focusTopics\":[],\"reviseClasses\":[],\"actionItems\":[],\"insights\":[]}",
    "",
    "Saved contest details:",
    JSON.stringify(contestDraft, null, 2),
  ].join("\n");
}

async function generateContestGuidanceWithoutLiveData(contestDraft) {
  const fallbackGuidance = buildContestOnlyFallbackGuidance(contestDraft);

  if (!isGeminiConfigured()) {
    return {
      ...fallbackGuidance,
      source: "demo-fallback",
    };
  }

  try {
    const response = await askGeminiWithSchema(buildContestOnlyPrompt(contestDraft), {
      responseSchema: CONTEST_GUIDANCE_SCHEMA,
      temperature: 0.3,
      maxOutputTokens: 900,
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
        ...fallbackGuidance,
        source: "demo-fallback",
      };
    }

    return {
      ...normalizedResponse,
      insights: uniqueItems([
        ...normalizedResponse.insights,
        "This fallback guidance is based on your saved contest details only.",
      ]).slice(0, 5),
      source: "demo-gemini",
      notice: LIVE_SYNC_DEMO_NOTICE,
    };
  } catch {
    return {
      ...fallbackGuidance,
      source: "demo-fallback",
    };
  }
}

export async function generateContestGuidance(
  contestDraft,
  { useLiveAcademicContext = true } = {},
) {
  if (!isValidContestDraft(contestDraft)) {
    throw new Error("A valid saved contest is required to generate prep guidance.");
  }

  if (!useLiveAcademicContext) {
    return generateContestGuidanceWithoutLiveData(contestDraft);
  }

  const context = await buildContestGuidanceContext(contestDraft);

  if (!context.hasAcademicContext) {
    return {
      ...buildFallbackContestGuidance(
        context,
        "Live academic data for this subject is limited, so safe contest prep guidance could not be generated yet.",
      ),
      source: "fallback",
      notice: "",
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
        notice: "",
      };
    }

    return {
      ...normalizedResponse,
      source: "gemini",
      notice: "",
    };
  } catch {
    return {
      ...buildFallbackContestGuidance(
        context,
        "AI prep guidance is unavailable right now, so showing safe prep signals from your live academic data instead.",
      ),
      source: "fallback",
      notice: "",
    };
  }
}
