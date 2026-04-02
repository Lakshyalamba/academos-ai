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

function getDisplayClassType(lecture, snapshot) {
  const name = String(
    lecture?.subjectName ||
      lecture?.title ||
      snapshot?.context?.subject?.subjectName ||
      snapshot?.context?.course?.courseTitle ||
      "",
  );

  return /\b(tut|lab)\b/i.test(name) ? "Lab" : "Class";
}

export function getEmptyNextClassState(
  message = "No upcoming class found in the current live schedule.",
) {
  return {
    available: false,
    subjectName: null,
    date: null,
    time: null,
    type: null,
    message,
  };
}

export function getNextClassFromSnapshot(snapshot) {
  const lecture = Array.isArray(snapshot?.schedule?.upcomingLectures)
    ? snapshot.schedule.upcomingLectures[0]
    : null;

  if (!lecture) {
    return getEmptyNextClassState();
  }

  return {
    available: true,
    subjectName:
      lecture.subjectName ||
      snapshot?.context?.subject?.subjectName ||
      snapshot?.context?.course?.courseTitle ||
      "Upcoming class",
    date: formatDateOnly(lecture.startTimestamp) || "Date not available",
    time: formatTimeOnly(lecture.startTimestamp) || "Time not available",
    type: getDisplayClassType(lecture, snapshot),
    message: lecture.startsAt
      ? `${lecture.subjectName || "Your next class"} starts on ${lecture.startsAt}.`
      : `${lecture.subjectName || "Your next class"} is the nearest scheduled lecture.`,
  };
}
