import "server-only";

import { getNewtonSnapshot } from "./newton-mcp";

const MAX_MISSED_LECTURES = 3;

function truncateTitle(value, maxLength = 72) {
  const text = String(value || "").trim();

  if (!text || text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 3).trimEnd()}...`;
}

function getUnavailableMessage(error) {
  const message = error instanceof Error ? error.message : "";

  if (/authentication required/i.test(message)) {
    return "Catch-up activity is unavailable until Newton MCP is authenticated.";
  }

  if (/not available locally|add it to codex/i.test(message)) {
    return "Connect Newton MCP locally to load missed lecture activity.";
  }

  return "Catch-up activity is unavailable right now.";
}

function buildCatchUpSuggestion(lecture) {
  const lectureName = truncateTitle(lecture?.title || lecture?.subjectName || "this lecture");

  if (lecture?.hasRecording) {
    return `Watch the recording for ${lectureName}.`;
  }

  if (lecture?.url) {
    return `Open the lecture page and review ${lectureName}.`;
  }

  return `Review ${lectureName} before the next class.`;
}

function getMissedLectures(snapshot) {
  const lectures = Array.isArray(snapshot?.recentLectures?.lectures)
    ? snapshot.recentLectures.lectures
    : [];

  return lectures
    .filter(
      (lecture) =>
        lecture &&
        lecture.isAttended === false &&
        lecture.isWatched === false,
    )
    .sort((left, right) => {
      const leftTime = left?.startTimestamp
        ? new Date(left.startTimestamp).getTime()
        : Number.NEGATIVE_INFINITY;
      const rightTime = right?.startTimestamp
        ? new Date(right.startTimestamp).getTime()
        : Number.NEGATIVE_INFINITY;

      return rightTime - leftTime;
    })
    .slice(0, MAX_MISSED_LECTURES)
    .map((lecture) => ({
      id: lecture.lectureHash || `${lecture.subjectName}-${lecture.startTimestamp || lecture.startsAt}`,
      subjectName: lecture.subjectName || "Course not available",
      lectureLabel: lecture.title || null,
      dateLabel: lecture.startsAt || "Date not available",
      suggestion: buildCatchUpSuggestion(lecture),
      hasRecording: Boolean(lecture.hasRecording),
    }));
}

export function getEmptyCatchUpState(message, { available = false } = {}) {
  return {
    available,
    items: [],
    emptyMessage: message,
  };
}

export async function getCatchUp({
  enabled = true,
} = {}) {
  if (!enabled) {
    return getEmptyCatchUpState(
      "Connect Newton MCP locally to load missed lecture activity.",
    );
  }

  try {
    const snapshot = await getNewtonSnapshot("What lectures did I miss?");
    const items = getMissedLectures(snapshot);

    if (items.length === 0) {
      return getEmptyCatchUpState("You're caught up on recent lectures.", {
        available: true,
      });
    }

    return {
      available: true,
      items,
      emptyMessage: "You're caught up on recent lectures.",
    };
  } catch (error) {
    return getEmptyCatchUpState(getUnavailableMessage(error));
  }
}
