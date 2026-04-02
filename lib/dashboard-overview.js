import "server-only";

import {
  buildClassEntryFromLecture,
  getClassesScheduleFromSnapshot,
  getEmptyClassesScheduleState,
} from "./class-schedule";
import { getNewtonSnapshot } from "./newton-mcp";

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
      classesSchedule: getEmptyClassesScheduleState({
        todayMessage: "Connect Newton MCP locally to load today's classes.",
        tomorrowMessage: "Connect Newton MCP locally to load tomorrow's classes.",
      }),
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
    const classesSchedule = getClassesScheduleFromSnapshot(snapshot, {
      now: today,
    });
    const classesToday = classesSchedule.today;
    const overdueItems = assignments.filter((assignment) =>
      isPastTimestamp(assignment.dueTimestamp, today),
    );
    const nextLecture = Array.isArray(lectures) ? lectures[0] : null;
    const nextClass = nextLecture
      ? buildClassEntryFromLecture(nextLecture, snapshot)
      : null;

    let message;

    if (classesToday.length > 0) {
      message = `You have ${formatCountLabel(classesToday.length, "class", "classes")} scheduled today.`;
    } else if (nextClass?.subjectName) {
      message = `No more classes are scheduled for today. Your next class is ${nextClass.subjectName} on ${nextClass.date}${nextClass.time ? ` at ${nextClass.time}` : ""}.`;
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
      classesSchedule,
    };
  } catch (error) {
    return {
      available: false,
      message: getUnavailableMessage(error),
      classesTodayCount: null,
      pendingAssignmentsCount: null,
      overdueItemsCount: null,
      classesSchedule: getEmptyClassesScheduleState({
        todayMessage: "Today's classes are unavailable until live schedule data can be loaded.",
        tomorrowMessage: "Tomorrow's classes are unavailable until live schedule data can be loaded.",
      }),
    };
  }
}
