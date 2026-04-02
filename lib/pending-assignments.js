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

function getUrgencyRank(assignment, { now, todayKey }) {
  const timestamp = assignment?.dueTimestamp
    ? new Date(assignment.dueTimestamp).getTime()
    : null;

  if (Number.isFinite(timestamp) && timestamp < now.getTime()) {
    return 0;
  }

  if (getDateKey(assignment?.dueTimestamp) === todayKey) {
    return 1;
  }

  return 2;
}

export function getEmptyPendingAssignmentsState(
  message = "No pending assignments found in the current live snapshot.",
) {
  return {
    available: false,
    items: [],
    emptyMessage: message,
  };
}

export function getPendingAssignmentsFromSnapshot(snapshot, { now = new Date() } = {}) {
  const assignments = Array.isArray(snapshot?.assignments?.assignments)
    ? snapshot.assignments.assignments
    : [];
  const todayKey = getDateKey(now);

  const items = assignments
    .map((assignment) => {
      const timestamp = assignment?.dueTimestamp
        ? new Date(assignment.dueTimestamp).getTime()
        : null;
      const overdue = Number.isFinite(timestamp) && timestamp < now.getTime();

      return {
        title: assignment?.title || "Untitled assignment",
        subjectName:
          assignment?.subjectName ||
          snapshot?.context?.subject?.subjectName ||
          snapshot?.context?.course?.courseTitle ||
          "Course not available",
        dueAt: assignment?.dueAt || null,
        dueTimestamp: assignment?.dueTimestamp || null,
        overdue,
        urgencyRank: getUrgencyRank(assignment, { now, todayKey }),
      };
    })
    .sort((left, right) => {
      if (left.urgencyRank !== right.urgencyRank) {
        return left.urgencyRank - right.urgencyRank;
      }

      const leftTimestamp = left.dueTimestamp
        ? new Date(left.dueTimestamp).getTime()
        : Number.POSITIVE_INFINITY;
      const rightTimestamp = right.dueTimestamp
        ? new Date(right.dueTimestamp).getTime()
        : Number.POSITIVE_INFINITY;

      if (leftTimestamp !== rightTimestamp) {
        return leftTimestamp - rightTimestamp;
      }

      return left.title.localeCompare(right.title);
    });

  return {
    available: true,
    items,
    emptyMessage: "No pending assignments found in the current live snapshot.",
  };
}
