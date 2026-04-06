import "server-only";

import { getNewtonSnapshot } from "./newton-mcp";

const WATCH_THRESHOLD = 85;
const RISK_THRESHOLD = 75;

function formatPercentage(value) {
  if (!Number.isFinite(value)) {
    return null;
  }

  return `${value.toFixed(1)}%`;
}

function normalizeSubjectGroupName(subjectName) {
  const rawName = String(subjectName || "").trim();

  if (!rawName) {
    return null;
  }

  const withoutBracketedType = rawName.replace(
    /\((?:lab|tut|tutorial|practical|class)\)/gi,
    " ",
  );
  const collapsed = withoutBracketedType
    .replace(/\b(?:lab|tut|tutorial|practical)\b/gi, " ")
    .replace(/\s*[-|:]\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return collapsed || rawName;
}

function getAttendanceState({ averagePercentage, lowestPercentage }) {
  if (
    averagePercentage < RISK_THRESHOLD ||
    lowestPercentage < RISK_THRESHOLD
  ) {
    return "risk";
  }

  if (
    averagePercentage < WATCH_THRESHOLD ||
    lowestPercentage < WATCH_THRESHOLD
  ) {
    return "watch";
  }

  return "healthy";
}

function getUnavailableMessage(error) {
  const message = error instanceof Error ? error.message : "";

  if (/authentication required/i.test(message)) {
    return "Attendance details are unavailable until Newton MCP is authenticated.";
  }

  if (/not available locally|add it to codex/i.test(message)) {
    return "Live academic sync is unavailable in this deployment, so attendance alerts are shown in fallback mode.";
  }

  return "Attendance details are unavailable right now.";
}

function getStateExplanation(state, weakestSubject, averageLabel) {
  if (!weakestSubject?.name || !weakestSubject?.percentageLabel) {
    if (state === "healthy") {
      return `Attendance is healthy overall at ${averageLabel}.`;
    }

    if (state === "watch") {
      return `Attendance needs a little attention overall at ${averageLabel}.`;
    }

    return `Low attendance may become risky at ${averageLabel}.`;
  }

  if (state === "healthy") {
    return `Attendance is healthy overall. ${weakestSubject.name} is currently the lowest at ${weakestSubject.percentageLabel}.`;
  }

  if (state === "watch") {
    return `${weakestSubject.name} needs attention. Your combined average is ${averageLabel}.`;
  }

  return `Low attendance may become risky. ${weakestSubject.name} is at ${weakestSubject.percentageLabel}.`;
}

function buildGroupedSubjects(subjectProgresses) {
  const groupedSubjects = new Map();

  for (const entry of subjectProgresses) {
    const performance = entry?.performance;
    const attendedLectures = performance?.lectures_attended;
    const totalLectures = performance?.total_lectures;

    if (
      typeof attendedLectures !== "number" ||
      typeof totalLectures !== "number" ||
      totalLectures <= 0
    ) {
      continue;
    }

    const name =
      normalizeSubjectGroupName(entry?.subjectName) ||
      String(entry?.subjectName || "").trim() ||
      "Subject";
    const existing = groupedSubjects.get(name) || {
      name,
      attendedLectures: 0,
      totalLectures: 0,
    };

    existing.attendedLectures += attendedLectures;
    existing.totalLectures += totalLectures;
    groupedSubjects.set(name, existing);
  }

  return [...groupedSubjects.values()]
    .map((subject) => {
      const percentage =
        subject.totalLectures > 0
          ? (subject.attendedLectures / subject.totalLectures) * 100
          : null;

      return {
        ...subject,
        percentage,
        percentageLabel: formatPercentage(percentage),
      };
    })
    .filter((subject) => Number.isFinite(subject.percentage))
    .sort((left, right) => {
      if (left.percentage !== right.percentage) {
        return left.percentage - right.percentage;
      }

      return left.name.localeCompare(right.name);
    });
}

export function getEmptyAttendanceAlert(message) {
  return {
    available: false,
    state: "unavailable",
    averagePercentage: null,
    averageLabel: null,
    subjectCount: 0,
    explanation: message,
    focusSubject: null,
    subjects: [],
  };
}

export async function getAttendanceAlert({
  enabled = true,
} = {}) {
  if (!enabled) {
    return getEmptyAttendanceAlert(
      "Live academic sync is unavailable in this deployment, so attendance alerts are shown in fallback mode.",
    );
  }

  try {
    const snapshot = await getNewtonSnapshot("Show attendance for all subjects");
    const subjectProgresses = Array.isArray(snapshot?.subjectProgresses)
      ? snapshot.subjectProgresses
      : [];
    const subjects = buildGroupedSubjects(subjectProgresses);

    if (subjects.length === 0) {
      return getEmptyAttendanceAlert(
        "Attendance data is not present in the current live snapshot.",
      );
    }

    const averagePercentage =
      subjects.reduce((sum, subject) => sum + subject.percentage, 0) /
      subjects.length;
    const averageLabel = formatPercentage(averagePercentage);
    const focusSubject = subjects[0] || null;
    const state = getAttendanceState({
      averagePercentage,
      lowestPercentage: focusSubject?.percentage ?? averagePercentage,
    });

    return {
      available: true,
      state,
      averagePercentage,
      averageLabel,
      subjectCount: subjects.length,
      explanation: getStateExplanation(state, focusSubject, averageLabel),
      focusSubject,
      subjects,
    };
  } catch (error) {
    return getEmptyAttendanceAlert(getUnavailableMessage(error));
  }
}
