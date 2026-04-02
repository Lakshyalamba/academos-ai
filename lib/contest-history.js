import "server-only";

import { getNewtonSnapshot } from "./newton-mcp";

function getTimestamp(value) {
  if (!value) {
    return Number.NaN;
  }

  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : Number.NaN;
}

function formatRankLabel(value) {
  const rank = Number(value);

  if (!Number.isFinite(rank) || rank <= 0) {
    return null;
  }

  return `Rank #${rank}`;
}

function formatScoreLabel(contest) {
  const score = typeof contest?.score === "number" ? contest.score : null;
  const maxScore = typeof contest?.maxScore === "number" ? contest.maxScore : null;

  if (score === null && maxScore === null) {
    return null;
  }

  if (score !== null && maxScore !== null) {
    return `Score ${score}/${maxScore}`;
  }

  if (score !== null) {
    return `Score ${score}`;
  }

  return `Out of ${maxScore}`;
}

function getContestDateLabel(contest) {
  return contest?.startsAt || contest?.dueAt || "Date not available";
}

function getContestSortTimestamp(contest) {
  const endTimestamp = getTimestamp(contest?.dueTimestamp);

  if (Number.isFinite(endTimestamp)) {
    return endTimestamp;
  }

  const startTimestamp = getTimestamp(contest?.startTimestamp);
  return Number.isFinite(startTimestamp) ? startTimestamp : Number.NEGATIVE_INFINITY;
}

function isPastContest(contest, nowTimestamp) {
  const sortTimestamp = getContestSortTimestamp(contest);

  if (!Number.isFinite(sortTimestamp)) {
    return true;
  }

  return sortTimestamp <= nowTimestamp;
}

function buildSubjectCards(contests) {
  const groupedContests = new Map();

  for (const contest of contests) {
    const subjectName = String(contest?.subjectName || "").trim() || "Subject";
    const entry = {
      id:
        contest?.contestHash ||
        `${subjectName}-${contest?.title || "contest"}-${contest?.dueTimestamp || contest?.startTimestamp || "na"}`,
      title: String(contest?.title || "").trim() || "Untitled contest",
      dateLabel: getContestDateLabel(contest),
      scoreLabel: formatScoreLabel(contest),
      rankLabel: formatRankLabel(contest?.rank),
      sortTimestamp: getContestSortTimestamp(contest),
      url: contest?.url || null,
    };

    if (!groupedContests.has(subjectName)) {
      groupedContests.set(subjectName, []);
    }

    groupedContests.get(subjectName).push(entry);
  }

  return [...groupedContests.entries()]
    .map(([subjectName, entries]) => {
      const sortedEntries = [...entries].sort((left, right) => {
        if (left.sortTimestamp !== right.sortTimestamp) {
          return right.sortTimestamp - left.sortTimestamp;
        }

        return left.title.localeCompare(right.title);
      });

      return {
        subjectName,
        contestCount: sortedEntries.length,
        latestTimestamp: sortedEntries[0]?.sortTimestamp ?? Number.NEGATIVE_INFINITY,
        entries: sortedEntries,
      };
    })
    .sort((left, right) => {
      if (left.latestTimestamp !== right.latestTimestamp) {
        return right.latestTimestamp - left.latestTimestamp;
      }

      return left.subjectName.localeCompare(right.subjectName);
    });
}

function getContestProgressLabel(performance) {
  const completed = performance?.completed_contest_questions;
  const total = performance?.total_contest_questions;

  if (
    typeof completed === "number" &&
    typeof total === "number" &&
    total > 0
  ) {
    return `${completed}/${total} contest questions completed overall.`;
  }

  return null;
}

function getUnavailableMessage(error) {
  const message = error instanceof Error ? error.message : "";

  if (/authentication required/i.test(message)) {
    return "Contest history is unavailable until Newton MCP is authenticated.";
  }

  if (/not available locally|add it to codex/i.test(message)) {
    return "Connect Newton MCP locally to load past contest scores.";
  }

  return "Past contest scores are unavailable right now.";
}

export function getEmptyContestHistory(message) {
  return {
    available: false,
    progressLabel: null,
    subjectCards: [],
    emptyMessage: message,
  };
}

export async function getContestHistory({ enabled = true } = {}) {
  if (!enabled) {
    return getEmptyContestHistory(
      "Connect Newton MCP locally to load past contest scores.",
    );
  }

  try {
    const snapshot = await getNewtonSnapshot("Show my past contest history and contest scorecard");
    const contests = Array.isArray(snapshot?.assignments?.contests)
      ? snapshot.assignments.contests
      : [];
    const nowTimestamp = Date.now();
    const pastContests = contests.filter((contest) => isPastContest(contest, nowTimestamp));

    return {
      available: true,
      progressLabel: getContestProgressLabel(snapshot?.overview?.performance),
      subjectCards: buildSubjectCards(pastContests),
      emptyMessage: "No past contest results were found in the current live record.",
    };
  } catch (error) {
    return getEmptyContestHistory(getUnavailableMessage(error));
  }
}
