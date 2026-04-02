import "server-only";

import { getNewtonSnapshot } from "./newton-mcp";

function getDateKey(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function isSameDate(value, dateKey) {
  return getDateKey(value) === dateKey;
}

function isPastTimestamp(value, referenceDate) {
  if (!value) {
    return false;
  }

  const timestamp = new Date(value).getTime();

  return Number.isFinite(timestamp) && timestamp < referenceDate.getTime();
}

function formatCountLabel(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function getUnavailableMessage(error) {
  const message = error instanceof Error ? error.message : "";

  if (/authentication required/i.test(message)) {
    return "Live academic data is unavailable until Newton MCP is authenticated.";
  }

  if (/not available locally|add it to codex/i.test(message)) {
    return "Connect Newton MCP locally to load today's academic overview.";
  }

  return "Today's academic overview is unavailable right now. The readiness cards below still reflect local setup.";
}

export async function getTodayOverview({
  enabled = true,
} = {}) {
  if (!enabled) {
    return {
      available: false,
      message: "Connect Newton MCP locally to load today's academic overview.",
      classesTodayCount: null,
      pendingAssignmentsCount: null,
      overdueItemsCount: null,
      nextClassTitle: null,
      nextClassTime: null,
    };
  }

  try {
    const snapshot = await getNewtonSnapshot("What should I focus on today?");
    const lectures = Array.isArray(snapshot?.schedule?.upcomingLectures)
      ? snapshot.schedule.upcomingLectures
      : [];
    const assignments = Array.isArray(snapshot?.assignments?.assignments)
      ? snapshot.assignments.assignments
      : [];
    const today = new Date();
    const todayKey = getDateKey(today);
    const classesToday = lectures.filter((lecture) =>
      isSameDate(lecture.startTimestamp, todayKey),
    );
    const overdueItems = assignments.filter((assignment) =>
      isPastTimestamp(assignment.dueTimestamp, today),
    );
    const nextClass = lectures[0] || null;

    let message;

    if (classesToday.length > 0) {
      message = `You have ${formatCountLabel(classesToday.length, "class", "classes")} scheduled today.`;
    } else if (nextClass?.subjectName && nextClass?.startsAt) {
      message = `No more classes are scheduled for today. Your next class is ${nextClass.subjectName} on ${nextClass.startsAt}.`;
    } else if (assignments.length > 0) {
      message = `No class schedule was found for the rest of today, but you still have open academic work to track.`;
    } else {
      message = "No live class or assignment activity was found for today in the fetched academic snapshot.";
    }

    return {
      available: true,
      message,
      classesTodayCount: classesToday.length,
      pendingAssignmentsCount: assignments.length,
      overdueItemsCount: overdueItems.length,
      nextClassTitle: nextClass?.subjectName || nextClass?.title || null,
      nextClassTime: nextClass?.startsAt || null,
    };
  } catch (error) {
    return {
      available: false,
      message: getUnavailableMessage(error),
      classesTodayCount: null,
      pendingAssignmentsCount: null,
      overdueItemsCount: null,
      nextClassTitle: null,
      nextClassTime: null,
    };
  }
}
