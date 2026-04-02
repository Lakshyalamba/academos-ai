function formatDateOnly(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "long",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function formatTimeOnly(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-IN", {
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

export function getClassDateKey(value) {
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

export function getDisplayClassType(lecture, snapshot) {
  const name = String(
    lecture?.subjectName ||
      lecture?.title ||
      snapshot?.context?.subject?.subjectName ||
      snapshot?.context?.course?.courseTitle ||
      "",
  );

  return /\b(tut|lab)\b/i.test(name) ? "Lab" : "Class";
}

export function buildClassEntryFromLecture(lecture, snapshot) {
  if (!lecture) {
    return null;
  }

  return {
    subjectName:
      lecture.subjectName ||
      snapshot?.context?.subject?.subjectName ||
      snapshot?.context?.course?.courseTitle ||
      "Upcoming class",
    date: formatDateOnly(lecture.startTimestamp) || "Date not available",
    time: formatTimeOnly(lecture.startTimestamp) || "Time not available",
    type: getDisplayClassType(lecture, snapshot),
    startsAt: lecture.startsAt || null,
  };
}

export function getEmptyClassesScheduleState({
  available = false,
  todayMessage = "No classes scheduled today.",
  tomorrowMessage = "No classes scheduled tomorrow.",
} = {}) {
  return {
    available,
    today: [],
    tomorrow: [],
    todayEmptyMessage: todayMessage,
    tomorrowEmptyMessage: tomorrowMessage,
  };
}

export function getClassesScheduleFromSnapshot(snapshot, { now = new Date() } = {}) {
  const lectures = Array.isArray(snapshot?.schedule?.upcomingLectures)
    ? snapshot.schedule.upcomingLectures
    : [];
  const todayKey = getClassDateKey(now);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowKey = getClassDateKey(tomorrow);

  const today = lectures
    .filter((lecture) => getClassDateKey(lecture.startTimestamp) === todayKey)
    .map((lecture) => buildClassEntryFromLecture(lecture, snapshot))
    .filter(Boolean);

  const tomorrowClasses = lectures
    .filter((lecture) => getClassDateKey(lecture.startTimestamp) === tomorrowKey)
    .map((lecture) => buildClassEntryFromLecture(lecture, snapshot))
    .filter(Boolean);

  return {
    available: true,
    today,
    tomorrow: tomorrowClasses,
    todayEmptyMessage: "No classes scheduled today.",
    tomorrowEmptyMessage: "No classes scheduled tomorrow.",
  };
}
