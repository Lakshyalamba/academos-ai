import "server-only";

import {
  buildClassEntryFromLecture,
  getClassesScheduleFromSnapshot,
  getEmptyClassesScheduleState,
} from "./class-schedule";
import { getNewtonSnapshot } from "./newton-mcp";
import {
  getEmptyPendingAssignmentsState,
  getPendingAssignmentsFromSnapshot,
} from "./pending-assignments";

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
    return "Live academic sync is unavailable in this deployment. Dashboard cards are showing fallback state.";
  }

  return "Today's academic overview is unavailable right now.";
}

export async function getTodayOverview({
  enabled = true,
} = {}) {
  if (!enabled) {
    return {
      available: false,
      message: "Live academic sync is unavailable in this deployment. Dashboard cards are showing fallback state.",
      classesTodayCount: null,
      pendingAssignmentsCount: null,
      overdueItemsCount: null,
      classesSchedule: getEmptyClassesScheduleState({
        todayMessage: "Live academic sync is unavailable, so today's classes are not shown here.",
        tomorrowMessage: "Live academic sync is unavailable, so tomorrow's classes are not shown here.",
      }),
      pendingAssignments: getEmptyPendingAssignmentsState(
        "Live academic sync is unavailable, so pending assignments are not shown here.",
      ),
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
    const pendingAssignments = getPendingAssignmentsFromSnapshot(snapshot, {
      now: today,
    });
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
      pendingAssignments,
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
      pendingAssignments: getEmptyPendingAssignmentsState(
        "Pending assignments are unavailable until live academic data can be loaded.",
      ),
    };
  }
}
