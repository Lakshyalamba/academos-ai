
import "server-only";

import { spawn } from "node:child_process";
import {
  NEWTON_CODEX_SERVER_NAME,
  NEWTON_CODEX_SETUP_COMMAND,
  NEWTON_LOGIN_COMMAND,
  NEWTON_MCP_PACKAGE,
  NEWTON_NPX_COMMAND,
} from "./server-config";

const MCP_PROTOCOL_VERSION = "2025-03-26";
const MCP_CLIENT_INFO = {
  name: "academos",
  version: "0.1.0",
};
export { NEWTON_CODEX_SERVER_NAME, NEWTON_CODEX_SETUP_COMMAND, NEWTON_LOGIN_COMMAND };

const NEWTON_COMMAND = NEWTON_NPX_COMMAND;
const NEWTON_ARGS = ["-y", NEWTON_MCP_PACKAGE];
const REQUEST_TIMEOUT_MS = 30000;

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matchesAlias(query, alias) {
  const normalizedAlias = normalizeText(alias);

  if (!normalizedAlias) {
    return false;
  }

  return new RegExp(`(?:^| )${escapeRegExp(normalizedAlias)}(?:$| )`).test(query);
}

function formatDateTime(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

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

function formatPercentage(attended, total) {
  if (!total) {
    return null;
  }

  return `${((attended / total) * 100).toFixed(1)}%`;
}

function formatCountLabel(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function truncateTitle(value, maxLength = 88) {
  const text = String(value || "").trim();

  if (!text || text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 3).trimEnd()}...`;
}

function formatOrdinal(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return String(value);
  }

  const mod10 = number % 10;
  const mod100 = number % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return `${number}st`;
  }

  if (mod10 === 2 && mod100 !== 12) {
    return `${number}nd`;
  }

  if (mod10 === 3 && mod100 !== 13) {
    return `${number}rd`;
  }

  return `${number}th`;
}

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

function getLeaderboardPeriod(query) {
  const normalizedQuery = normalizeText(query);

  if (/\bweekly\b|\bthis week\b/.test(normalizedQuery)) {
    return "weekly";
  }

  if (/\bmonthly\b|\bthis month\b/.test(normalizedQuery)) {
    return "monthly";
  }

  return "overall";
}

function isSameDate(value, dateKey) {
  return getDateKey(value) === dateKey;
}

function parseToolPayload(result) {
  if (result?.isError) {
    const text = result?.content?.find((item) => item.type === "text")?.text;
    throw new Error(text || "Newton MCP tool call failed.");
  }

  const text = result?.content?.find((item) => item.type === "text")?.text;

  if (!text) {
    throw new Error("Newton MCP returned no text payload.");
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Newton MCP returned invalid JSON.");
  }
}

class NewtonMcpClient {
  constructor() {
    this.child = spawn(NEWTON_COMMAND, NEWTON_ARGS, {
      stdio: ["pipe", "pipe", "pipe"],
    });
    this.nextId = 1;
    this.buffer = "";
    this.pending = new Map();
    this.stderr = "";

    this.child.stdout.on("data", (chunk) => {
      this.buffer += chunk.toString();

      while (true) {
        const newlineIndex = this.buffer.indexOf("\n");

        if (newlineIndex === -1) {
          return;
        }

        const line = this.buffer.slice(0, newlineIndex).trim();
        this.buffer = this.buffer.slice(newlineIndex + 1);

        if (!line) {
          continue;
        }

        let message;

        try {
          message = JSON.parse(line);
        } catch {
          this.stderr += `${line}\n`;
          continue;
        }

        if (typeof message.id === "undefined" || !this.pending.has(message.id)) {
          continue;
        }

        const { resolve, reject, timeoutId } = this.pending.get(message.id);
        this.pending.delete(message.id);
        clearTimeout(timeoutId);

        if (message.error) {
          reject(new Error(JSON.stringify(message.error)));
        } else {
          resolve(message.result);
        }
      }
    });

    this.child.stderr.on("data", (chunk) => {
      this.stderr += chunk.toString();
    });

    this.child.on("error", (error) => {
      const detail =
        error instanceof Error ? error.message : "Unable to start Newton MCP.";

      for (const { reject, timeoutId } of this.pending.values()) {
        clearTimeout(timeoutId);
        reject(new Error(detail));
      }

      this.pending.clear();
    });

    this.child.on("exit", (code) => {
      if (code === 0) {
        return;
      }

      const detail = this.stderr.trim();

      for (const { reject, timeoutId } of this.pending.values()) {
        clearTimeout(timeoutId);
        reject(
          new Error(
            detail
              ? `Newton MCP exited with code ${code}: ${detail}`
              : `Newton MCP exited with code ${code}.`,
          ),
        );
      }

      this.pending.clear();
    });
  }

  send(message) {
    this.child.stdin.write(`${JSON.stringify(message)}\n`);
  }

  request(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.nextId++;
      const timeoutId = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Newton MCP request timed out for ${method}.`));
      }, REQUEST_TIMEOUT_MS);

      this.pending.set(id, { resolve, reject, timeoutId });
      this.send({
        jsonrpc: "2.0",
        id,
        method,
        params,
      });
    });
  }

  notify(method, params = {}) {
    this.send({
      jsonrpc: "2.0",
      method,
      params,
    });
  }

  async initialize() {
    await this.request("initialize", {
      protocolVersion: MCP_PROTOCOL_VERSION,
      capabilities: {},
      clientInfo: MCP_CLIENT_INFO,
    });

    this.notify("notifications/initialized");
  }

  async callTool(name, args = {}) {
    const result = await this.request("tools/call", {
      name,
      arguments: args,
    });

    return parseToolPayload(result);
  }

  close() {
    if (!this.child.killed) {
      this.child.kill();
    }
  }
}

function extractSubjectAliases(subjectName) {
  const aliases = new Set();
  const baseName = String(subjectName || "").trim();
  const beforeSection = baseName.split(" - ")[0]?.trim();

  if (baseName) {
    aliases.add(baseName);
  }

  if (beforeSection) {
    aliases.add(beforeSection);
  }

  return [...aliases];
}

function resolveCourseContext(courseData, query) {
  const courses = Array.isArray(courseData?.courses) ? courseData.courses : [];
  const normalizedQuery = normalizeText(query);
  const primaryCourse =
    courses.find((course) => course.course_hash === courseData?.primary_course_hash) ||
    courses.find((course) => course.is_primary) ||
    courses[0] ||
    null;

  let bestSubjectMatch = null;

  for (const course of courses) {
    for (const subject of course.subjects || []) {
      for (const alias of extractSubjectAliases(subject.subject_name)) {
        if (!matchesAlias(normalizedQuery, alias)) {
          continue;
        }

        const score = normalizeText(alias).length;

        if (!bestSubjectMatch || score > bestSubjectMatch.score) {
          bestSubjectMatch = { course, subject, score };
        }
      }
    }
  }

  if (bestSubjectMatch) {
    return {
      course: bestSubjectMatch.course,
      subject: bestSubjectMatch.subject,
      matchedBy: "subject",
      primaryCourse,
    };
  }

  let bestCourseMatch = null;

  for (const course of courses) {
    const aliases = [course.semester_name, course.course_title].filter(Boolean);

    for (const alias of aliases) {
      if (!matchesAlias(normalizedQuery, alias)) {
        continue;
      }

      const score = normalizeText(alias).length;

      if (!bestCourseMatch || score > bestCourseMatch.score) {
        bestCourseMatch = { course, score };
      }
    }
  }

  return {
    course: bestCourseMatch?.course || primaryCourse,
    subject: null,
    matchedBy: bestCourseMatch ? "course" : "primary",
    primaryCourse,
  };
}

function detectIntent(query) {
  const normalizedQuery = normalizeText(query);
  const asksCourses =
    /\bcourses?\b|\benrolled\b|\bplacement\b|\bother courses\b|\bother course\b/.test(
      normalizedQuery,
    );
  const asksAttendance = /\battendance\b|\battend\b/.test(normalizedQuery);
  const asksAssignments =
    /\bassignment\b|\bassignments\b|\bpending\b|\bdue\b|\bhomework\b|\bsubmission\b|\bsubmissions\b/.test(
      normalizedQuery,
    );
  const asksContests =
    /\bcontest\b|\bcontests\b|\bcoding contest\b|\bmid sem\b/.test(
      normalizedQuery,
    );
  const asksQuizzes =
    /\bscore\b|\bscores\b|\bmarks\b|\bmark\b|\bquiz\b|\bquizzes\b|\bassessment\b|\bassessments\b|\bmcq\b|\bresult\b|\bresults\b|\btest score\b/.test(
      normalizedQuery,
    );
  const asksScorecard = /\bscorecard\b/.test(normalizedQuery);
  const asksSubjectPerformance =
    /\ball subjects\b|\beach subject\b|\bsubject wise\b|\bsubject wise\b|\bsubject performance\b|\btopic wise\b|\btopic-wise\b/.test(
      normalizedQuery,
    );
  const asksNextClass =
    /\bnext class\b|\bnext lecture\b|\bwhen is my next class\b|\bwhen is the next class\b/.test(
      normalizedQuery,
    );
  const asksCalendar =
    /\bcalendar\b|\bevents\b|\bwhat s scheduled\b|\bwhat is scheduled\b|\bscheduled on\b/.test(
      normalizedQuery,
    );
  const asksTimeline =
    /\btimeline\b|\brecent lectures\b|\bpast lectures\b|\brecent classes\b|\bwhat lectures did i miss\b|\bmissed lectures\b|\brecent activity\b/.test(
      normalizedQuery,
    );
  const asksArena =
    /\barena\b|\bpractice\b|\bproblems solved\b|\bquestions solved\b|\bcoding stats\b|\bsolve count\b/.test(
      normalizedQuery,
    );
  const asksQotd =
    /\bqotd\b|question of the day|daily question|daily challenge|\bmy streak\b/.test(
      normalizedQuery,
    );
  const asksExpertSessions = /\bexpert session\b|\bexpert sessions\b/.test(
    normalizedQuery,
  );
  const asksResume = /\bresume\b|\bresume related\b/.test(normalizedQuery);
  const asksConcerns = /\bconcern\b|\bconcerns\b/.test(normalizedQuery);
  const asksSchedule =
    /\bschedule\b|\btimetable\b|\bcoming up\b|\bupcoming\b|\bclasses this week\b|\bwhat do i have\b|\bwhat classes do i have\b/.test(
      normalizedQuery,
    );
  const asksRank =
    /\brank\b|\bleaderboard\b|\bposition\b|\bwhere do i stand\b|\bclass rank\b|\btopper\b/.test(
      normalizedQuery,
    );
  const asksPerformance =
    /how am i doing|\bprogress\b|\bperformance\b|\bdoing in\b|\bmy stats\b|\bmy rank\b|\bxp\b|\blevel\b/.test(
      normalizedQuery,
    );
  const asksToday =
    /\btoday\b|what should i do|plan for today|focus today|what should i focus on|tomorrow/.test(
      normalizedQuery,
    );

  if (asksExpertSessions) {
    return "expert_sessions";
  }

  if (asksResume) {
    return "resume";
  }

  if (asksConcerns) {
    return "concerns";
  }

  if (asksQotd) {
    return "qotd";
  }

  if (asksArena) {
    return "arena";
  }

  if (asksCalendar) {
    return "calendar";
  }

  if (asksTimeline) {
    return "timeline";
  }

  if (asksCourses && !asksToday) {
    return "courses";
  }

  if (asksContests && !asksAssignments) {
    return "contests";
  }

  if (asksQuizzes) {
    return "quizzes";
  }

  if (asksSubjectPerformance) {
    return "subject_performance";
  }

  if (asksScorecard) {
    return "performance";
  }

  if (asksAttendance && !asksAssignments && !asksToday) {
    return "attendance";
  }

  if (asksAssignments && !asksToday) {
    return "assignments";
  }

  if (asksRank) {
    return "rank";
  }

  if (asksNextClass) {
    return "next_class";
  }

  if (asksPerformance) {
    return "performance";
  }

  if (asksSchedule && !asksToday) {
    return "schedule";
  }

  return "today";
}

function simplifyCourse(course) {
  if (!course) {
    return null;
  }

  return {
    courseHash: course.course_hash,
    courseTitle: course.course_title,
    semesterName: course.semester_name,
    isPrimary: Boolean(course.is_primary),
    isOngoingSemester: Boolean(course.is_ongoing_semester),
  };
}

function simplifySubject(subject) {
  if (!subject) {
    return null;
  }

  return {
    subjectHash: subject.subject_hash,
    subjectName: subject.subject_name,
  };
}

function simplifyCourseCatalog(courseData) {
  const courses = Array.isArray(courseData?.courses) ? courseData.courses : [];

  return courses.map((course) => ({
    ...simplifyCourse(course),
    subjects: Array.isArray(course.subjects)
      ? course.subjects.map((subject) => simplifySubject(subject))
      : [],
  }));
}

function simplifyAssignments(payload) {
  if (!payload) {
    return null;
  }

  return {
    assignments: Array.isArray(payload.assignments)
      ? payload.assignments.map((assignment) => ({
          subjectName: assignment.subject_name,
          title: assignment.title,
          dueAt: formatDateTime(assignment.end_timestamp),
          dueTimestamp: assignment.end_timestamp,
          totalQuestions: assignment.total_questions,
          url: assignment.url,
        }))
      : [],
    contests: Array.isArray(payload.contests)
      ? payload.contests.map((contest) => ({
          contestHash: contest.hash || null,
          subjectName: contest.subject_name,
          title: contest.title,
          startsAt: formatDateTime(contest.start_timestamp),
          startTimestamp: contest.start_timestamp,
          dueAt: formatDateTime(contest.end_timestamp),
          dueTimestamp: contest.end_timestamp,
          totalQuestions: contest.total_questions,
          score:
            typeof contest.score === "number"
              ? contest.score
              : typeof contest.earned_points === "number"
                ? contest.earned_points
                : null,
          maxScore:
            typeof contest.max_score === "number"
              ? contest.max_score
              : typeof contest.earnable_points === "number"
                ? contest.earnable_points
                : null,
          rank: typeof contest.rank === "number" ? contest.rank : null,
          url: contest.url,
        }))
      : [],
  };
}

function simplifySchedule(payload) {
  if (!payload) {
    return null;
  }

  return {
    upcomingLectures: Array.isArray(payload.upcoming_lectures)
      ? payload.upcoming_lectures.map((lecture) => ({
          subjectHash: lecture.subject_hash,
          subjectName: lecture.subject_name,
          startsAt: formatDateTime(lecture.start_timestamp),
          startTimestamp: lecture.start_timestamp,
          endsAt: formatDateTime(lecture.end_timestamp),
          type: lecture.type,
          url: lecture.url,
        }))
      : [],
    upcomingContests: Array.isArray(payload.upcoming_contests)
      ? payload.upcoming_contests.map((contest) => ({
          subjectName: contest.subject_name,
          startsAt: formatDateTime(contest.start_timestamp),
          startTimestamp: contest.start_timestamp,
          endsAt: formatDateTime(contest.end_timestamp),
          title: contest.title,
          url: contest.url,
        }))
      : [],
  };
}

function simplifyOverview(payload) {
  if (!payload) {
    return null;
  }

  return {
    courseTitle: payload.course_title,
    performance: payload.performance || null,
    xp: payload.xp || null,
  };
}

function simplifyLeaderboard(payload) {
  if (!payload) {
    return null;
  }

  return {
    period: payload.period || "overall",
    entries: Array.isArray(payload.entries)
      ? payload.entries.map((entry) => ({
          name: entry.name,
          rank: entry.rank,
          xp: entry.xp,
          isCurrentUser: Boolean(entry.is_current_user),
        }))
      : [],
    url: payload.url || null,
  };
}

function simplifyAssessmentItems(payload) {
  if (!payload) {
    return [];
  }

  return Array.isArray(payload.assessments)
    ? payload.assessments.map((assessment) => ({
        title: assessment.title,
        earnedPoints: assessment.earned_points,
        earnablePoints: assessment.earnable_points,
        startsAt: formatDateTime(assessment.start_timestamp),
        endsAt: formatDateTime(assessment.end_timestamp),
        endTimestamp: assessment.end_timestamp,
        url: assessment.url,
      }))
    : [];
}

function simplifyAssessmentCollection(subject, payload) {
  return {
    subjectHash: subject?.subject_hash || null,
    subjectName: subject?.subject_name || null,
    assessments: simplifyAssessmentItems(payload),
    url: payload?.url || null,
  };
}

function simplifySubjectProgress(subject, payload) {
  return {
    subjectHash: subject?.subject_hash || null,
    subjectName: subject?.subject_name || null,
    performance: payload?.performance || null,
    url: payload?.url || null,
  };
}

function simplifyCalendar(payload) {
  if (!payload) {
    return null;
  }

  return {
    numberOfDays: payload.number_of_days || 0,
    dateFilter: payload.date_filter || null,
    events: Array.isArray(payload.events)
      ? payload.events.map((event) => ({
          hash: event.hash,
          subjectName: event.subject_name || null,
          title: event.title || null,
          type: event.type || null,
          startsAt: formatDateTime(event.start_timestamp),
          startTimestamp: event.start_timestamp,
          endsAt: formatDateTime(event.end_timestamp),
          endTimestamp: event.end_timestamp,
        }))
      : [],
  };
}

function simplifyRecentLectures(payload) {
  if (!payload) {
    return null;
  }

  return {
    returnedCount: payload.returned_count || 0,
    lectures: Array.isArray(payload.lectures)
      ? payload.lectures.map((lecture) => ({
          lectureHash: lecture.lecture_hash,
          subjectHash: lecture.subject_hash,
          subjectName: lecture.subject_name,
          title: lecture.title || null,
          instructor: lecture.instructor || null,
          hasRecording: Boolean(lecture.has_recording),
          isAttended: Boolean(lecture.is_attended),
          isWatched: Boolean(lecture.is_watched),
          startsAt: formatDateTime(lecture.start_timestamp),
          startTimestamp: lecture.start_timestamp,
          endsAt: formatDateTime(lecture.end_timestamp),
          endTimestamp: lecture.end_timestamp,
          earnableXp: lecture.earnable_xp?.earnable_points ?? null,
          earnedXp: lecture.earnable_xp?.earned_points ?? null,
          xpDeadline: formatDateTime(lecture.earnable_xp?.deadline),
          url: lecture.url,
        }))
      : [],
  };
}

function simplifyArenaStats(payload) {
  if (!payload) {
    return null;
  }

  return {
    solvedCount: payload.solved_count ?? null,
    solvedPercentage: payload.solved_percentage ?? null,
    todaySolvedCount: payload.today_solved_count ?? null,
    totalQuestions: payload.total_questions ?? null,
    url: payload.url || null,
  };
}

function simplifyQuestionOfTheDay(payload) {
  if (!payload) {
    return null;
  }

  return {
    title: payload.title || null,
    slug: payload.slug || null,
    currentStreak: payload.current_streak ?? null,
    longestStreak: payload.longest_streak ?? null,
    streakLives: payload.streak_lives ?? null,
    attemptedByCount: payload.attempted_by_count ?? null,
    attemptedCount: payload.attempted_count ?? null,
    completedCount: payload.completed_count ?? null,
    url: payload.url || null,
  };
}

function simplifyQotdHistory(payload) {
  if (!payload) {
    return null;
  }

  return {
    leaderboard: Array.isArray(payload.leaderboard)
      ? payload.leaderboard.map((entry) => ({
          name: entry.name,
          rank: entry.rank,
          streak: entry.streak,
        }))
      : [],
    pastQuestions: Array.isArray(payload.past_questions)
      ? payload.past_questions.map((question) => ({
          title: question.title,
          slug: question.slug,
          date: formatDateOnly(question.date),
          dateTimestamp: question.date,
          attemptedByCount: question.attempted_by_count ?? null,
          isAttempted: Boolean(question.is_attempted),
          isCompleted: Boolean(question.is_completed),
          completedOnSameDay: Boolean(question.completed_on_same_day),
        }))
      : [],
    url: payload.url || null,
  };
}

function simplifyAttendance(context, overview, subjectProgresses = []) {
  const performance = context?.subject
    ? subjectProgresses.find(
        (progress) => progress.subjectHash === context.subject.subject_hash,
      )?.performance
    : overview?.performance;
  const attended = performance?.lectures_attended;
  const total = performance?.total_lectures;

  if (typeof attended !== "number" || typeof total !== "number" || total <= 0) {
    return {
      available: false,
      source: context?.subject ? "get_subject_progress" : "get_course_overview",
      reason: "Attendance data was not present in the MCP response.",
    };
  }

  return {
    available: true,
    source: context?.subject ? "get_subject_progress" : "get_course_overview",
    attendedLectures: attended,
    totalLectures: total,
    percentage: formatPercentage(attended, total),
  };
}

function buildDataNotFoundResponse() {
  return {
    summary: "Data not found",
    tasks: [],
    insights: [],
  };
}

function getRelevantLectures(snapshot) {
  const lectures = snapshot.schedule?.upcomingLectures || [];
  const subjectHash = snapshot.context.subject?.subjectHash;

  if (!subjectHash) {
    return lectures;
  }

  return lectures.filter((lecture) => lecture.subjectHash === subjectHash);
}

function getRelevantAssignments(snapshot) {
  const assignments = snapshot.assignments?.assignments || [];
  const subjectName = snapshot.context.subject?.subjectName;

  if (!subjectName) {
    return assignments;
  }

  return assignments.filter((assignment) => assignment.subjectName === subjectName);
}

function getRelevantContests(snapshot) {
  const contests = snapshot.assignments?.contests || [];
  const subjectName = snapshot.context.subject?.subjectName;

  if (!subjectName) {
    return contests;
  }

  return contests.filter((contest) => contest.subjectName === subjectName);
}

function getRelevantUpcomingContests(snapshot) {
  const contests = snapshot.schedule?.upcomingContests || [];
  const subjectName = snapshot.context.subject?.subjectName;

  if (!subjectName) {
    return contests;
  }

  return contests.filter((contest) => contest.subjectName === subjectName);
}

function getRelevantRecentLectures(snapshot) {
  const lectures = snapshot.recentLectures?.lectures || [];
  const subjectHash = snapshot.context.subject?.subjectHash;

  if (!subjectHash) {
    return lectures;
  }

  return lectures.filter((lecture) => lecture.subjectHash === subjectHash);
}

function getRelevantSubjectProgresses(snapshot) {
  const progressEntries = snapshot.subjectProgresses || [];
  const subjectHash = snapshot.context.subject?.subjectHash;

  if (!subjectHash) {
    return progressEntries;
  }

  return progressEntries.filter((entry) => entry.subjectHash === subjectHash);
}

function getRelevantAssessmentCollections(snapshot) {
  const collections = snapshot.assessments || [];
  const subjectHash = snapshot.context.subject?.subjectHash;

  if (!subjectHash) {
    return collections;
  }

  return collections.filter((entry) => entry.subjectHash === subjectHash);
}

function flattenAssessments(collections) {
  return collections
    .flatMap((collection) =>
      (collection.assessments || []).map((assessment) => ({
        ...assessment,
        subjectHash: collection.subjectHash,
        subjectName: collection.subjectName,
      })),
    )
    .sort((left, right) => {
      const leftValue = new Date(left.endTimestamp || 0).getTime();
      const rightValue = new Date(right.endTimestamp || 0).getTime();

      return rightValue - leftValue;
    });
}

function buildSubjectPerformanceLabel(entry) {
  const performance = entry?.performance;

  if (!performance) {
    return null;
  }

  const segments = [];

  if (
    typeof performance.lectures_attended === "number" &&
    typeof performance.total_lectures === "number" &&
    performance.total_lectures > 0
  ) {
    segments.push(
      `attendance ${performance.lectures_attended}/${performance.total_lectures} (${formatPercentage(performance.lectures_attended, performance.total_lectures)})`,
    );
  }

  if (
    typeof performance.completed_assignment_questions === "number" &&
    typeof performance.total_assignment_questions === "number" &&
    performance.total_assignment_questions > 0
  ) {
    segments.push(
      `assignments ${performance.completed_assignment_questions}/${performance.total_assignment_questions}`,
    );
  }

  if (
    typeof performance.completed_assessments === "number" &&
    typeof performance.total_assessments === "number" &&
    performance.total_assessments > 0
  ) {
    segments.push(
      `quizzes ${performance.completed_assessments}/${performance.total_assessments}`,
    );
  }

  if (segments.length === 0) {
    return null;
  }

  return `${entry.subjectName}: ${segments.join(", ")}.`;
}

function getScopeLabel(snapshot) {
  return (
    snapshot.context.subject?.subjectName ||
    snapshot.context.course?.semesterName ||
    snapshot.context.course?.courseTitle ||
    "your course"
  );
}

function getTodayContext() {
  const now = new Date();
  const todayKey = getDateKey(now);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  return {
    now,
    todayKey,
    tomorrowKey: getDateKey(tomorrow),
    todayLabel: formatDateOnly(now),
    tomorrowLabel: formatDateOnly(tomorrow),
  };
}

function buildAttendanceResponse(snapshot) {
  const attendance = snapshot.attendance;
  const attended = attendance?.attendedLectures;
  const total = attendance?.totalLectures;
  const scope = getScopeLabel(snapshot);

  if (!attendance?.available || typeof attended !== "number" || typeof total !== "number") {
    return buildDataNotFoundResponse();
  }

  const percentage = attendance.percentage;
  const missed = Math.max(total - attended, 0);
  const nextLecture = getRelevantLectures(snapshot)[0] || null;
  const tasks = [];
  const insights = [
    `${scope} attendance is ${attended}/${total} lectures (${percentage}).`,
    `You have missed ${formatCountLabel(missed, "lecture", "lectures")} in this scope.`,
  ];

  if (nextLecture?.startsAt) {
    tasks.push(`Attend the next ${nextLecture.subjectName} lecture on ${nextLecture.startsAt}.`);
    insights.push(`Your next relevant lecture is on ${nextLecture.startsAt}.`);
  }

  if ((attended / total) * 100 < 75) {
    tasks.push("Prioritize every upcoming lecture until your attendance recovers.");
  } else if ((attended / total) * 100 < 90) {
    tasks.push("Stay consistent for the next few lectures to push this attendance closer to 90%.");
  } else {
    tasks.push("Keep attending the upcoming lectures to preserve this strong attendance rate.");
  }

  if (missed > 0) {
    tasks.push(`Catch up on notes or recordings for the ${missed} lecture${missed === 1 ? "" : "s"} you missed.`);
  }

  return {
    summary: `Your attendance in ${scope} is ${attended}/${total} lectures, which is ${percentage}.`,
    tasks: tasks.slice(0, 3),
    insights: insights.slice(0, 3),
  };
}

function buildAssignmentsResponse(snapshot) {
  const assignments = getRelevantAssignments(snapshot);
  const scope = getScopeLabel(snapshot);

  if (assignments.length === 0) {
    return buildDataNotFoundResponse();
  }

  const nextAssignment = assignments[0];
  const tasks = assignments.slice(0, 3).map((assignment) => {
    const dueText = assignment.dueAt ? ` by ${assignment.dueAt}` : "";
    return `Complete ${truncateTitle(assignment.title)} for ${assignment.subjectName}${dueText}.`;
  });
  const insights = [
    `${formatCountLabel(assignments.length, "assignment is", "assignments are")} currently pending for ${scope}.`,
    `The nearest pending item is ${truncateTitle(nextAssignment.title, 72)}${nextAssignment.dueAt ? ` due ${nextAssignment.dueAt}` : ""}.`,
    "Assignments are tracked separately from contests and quizzes.",
  ];

  if (
    !snapshot.context.subject &&
    snapshot.overview?.performance?.completed_assignment_questions !== undefined
  ) {
    const completed = snapshot.overview.performance.completed_assignment_questions;
    const total = snapshot.overview.performance.total_assignment_questions;

    if (typeof completed === "number" && typeof total === "number" && total > 0) {
      insights.push(`Assignment progress stands at ${completed}/${total} completed questions.`);
    }
  }

  return {
    summary: `You have ${assignments.length} pending assignments in ${scope}, and the nearest one is ${truncateTitle(nextAssignment.title, 72)}.`,
    tasks,
    insights: insights.slice(0, 3),
  };
}

function buildContestResponse(snapshot) {
  const contests = getRelevantContests(snapshot);
  const upcomingContests = getRelevantUpcomingContests(snapshot);
  const performance = snapshot.overview?.performance;
  const scope = getScopeLabel(snapshot);

  if (
    contests.length === 0 &&
    upcomingContests.length === 0 &&
    (snapshot.context.subject || typeof performance?.total_contest_questions !== "number")
  ) {
    return buildDataNotFoundResponse();
  }

  const tasks = [];
  const insights = ["Contests are separate from assignments and quizzes."];

  if (
    !snapshot.context.subject &&
    typeof performance?.completed_contest_questions === "number" &&
    typeof performance?.total_contest_questions === "number" &&
    performance.total_contest_questions > 0
  ) {
    insights.push(
      `Contest performance is ${performance.completed_contest_questions}/${performance.total_contest_questions} completed questions.`,
    );
  }

  if (upcomingContests[0]) {
    tasks.push(
      `Prepare for ${truncateTitle(upcomingContests[0].title, 72)}${upcomingContests[0].startsAt ? ` on ${upcomingContests[0].startsAt}` : ""}.`,
    );
    insights.push(
      `The next scheduled contest is ${truncateTitle(upcomingContests[0].title, 72)}${upcomingContests[0].startsAt ? ` on ${upcomingContests[0].startsAt}` : ""}.`,
    );
  }

  if (contests[0]) {
    tasks.push(
      `Review ${truncateTitle(contests[0].title, 72)} for ${contests[0].subjectName}${contests[0].dueAt ? ` by ${contests[0].dueAt}` : ""}.`,
    );
  }

  if (tasks.length === 0) {
    tasks.push(`Open the contest section for ${scope} and review the latest contest entry.`);
  }

  return {
    summary:
      contests[0] || upcomingContests[0]
        ? `I found ${formatCountLabel(contests.length, "contest", "contests")} for ${scope}${upcomingContests[0] ? `, and the next scheduled contest is ${truncateTitle(upcomingContests[0].title, 68)}` : ""}.`
        : `Contest performance data is available for ${scope}.`,
    tasks: tasks.slice(0, 3),
    insights: insights.slice(0, 3),
  };
}

function buildNextClassResponse(snapshot) {
  const lectures = getRelevantLectures(snapshot);
  const scope = getScopeLabel(snapshot);
  const nextLecture = lectures[0];

  if (!nextLecture) {
    return buildDataNotFoundResponse();
  }

  return {
    summary: `Your next class${snapshot.context.subject ? ` in ${scope}` : ""} is ${nextLecture.subjectName} on ${nextLecture.startsAt}.`,
    tasks: [
      `Be ready for ${nextLecture.subjectName} by ${nextLecture.startsAt}.`,
      `Review the last notes or pending work for ${nextLecture.subjectName} before class starts.`,
    ],
    insights: [
      `The next scheduled lecture is ${nextLecture.subjectName}.`,
      `${formatCountLabel(lectures.length, "lecture is", "lectures are")} scheduled in the next 7 days for this scope.`,
    ],
  };
}

function buildScheduleResponse(snapshot) {
  const lectures = getRelevantLectures(snapshot);
  const assignments = getRelevantAssignments(snapshot);
  const scope = getScopeLabel(snapshot);

  if (lectures.length === 0 && assignments.length === 0) {
    return buildDataNotFoundResponse();
  }

  const tasks = [];
  const insights = [];

  if (lectures[0]) {
    tasks.push(`Prepare for ${lectures[0].subjectName} on ${lectures[0].startsAt}.`);
    insights.push(`Your next lecture is ${lectures[0].subjectName} on ${lectures[0].startsAt}.`);
  }

  if (lectures[1]) {
    tasks.push(`Plan around the following lecture: ${lectures[1].subjectName} on ${lectures[1].startsAt}.`);
  }

  if (assignments[0]) {
    tasks.push(
      `Complete ${truncateTitle(assignments[0].title, 72)} for ${assignments[0].subjectName}${assignments[0].dueAt ? ` by ${assignments[0].dueAt}` : ""}.`,
    );
    insights.push(`The nearest assignment deadline is ${truncateTitle(assignments[0].title, 60)}.`);
  }

  return {
    summary: `Your upcoming schedule for ${scope} starts with ${lectures[0] ? `${lectures[0].subjectName} on ${lectures[0].startsAt}` : "an assignment deadline"}.`,
    tasks: tasks.slice(0, 3),
    insights: [
      ...insights,
      `${formatCountLabel(lectures.length, "lecture is", "lectures are")} scheduled in the next 7 days.`,
    ].slice(0, 3),
  };
}

function buildPerformanceResponse(snapshot) {
  if (snapshot.context.subject) {
    return buildSubjectPerformanceResponse(snapshot);
  }

  const scope = getScopeLabel(snapshot);
  const performance = snapshot.overview?.performance;
  const assignments = getRelevantAssignments(snapshot);
  const lectures = getRelevantLectures(snapshot);

  if (!performance) {
    return buildDataNotFoundResponse();
  }

  const attended = performance.lectures_attended;
  const totalLectures = performance.total_lectures;
  const assignmentDone = performance.completed_assignment_questions;
  const assignmentTotal = performance.total_assignment_questions;
  const assessmentDone = performance.completed_assessments;
  const assessmentTotal = performance.total_assessments;
  const contestDone = performance.completed_contest_questions;
  const contestTotal = performance.total_contest_questions;
  const totalXp = snapshot.overview?.xp?.total_earned;

  const insights = [];
  const tasks = [];

  if (typeof totalXp === "number") {
    insights.push(`Total earned XP is ${totalXp}.`);
  }

  if (typeof attended === "number" && typeof totalLectures === "number" && totalLectures > 0) {
    insights.push(`Attendance is ${attended}/${totalLectures} (${formatPercentage(attended, totalLectures)}).`);
  }

  if (
    typeof assignmentDone === "number" &&
    typeof assignmentTotal === "number" &&
    assignmentTotal > 0
  ) {
    insights.push(`Assignment progress is ${assignmentDone}/${assignmentTotal} completed questions.`);
  }

  if (
    typeof assessmentDone === "number" &&
    typeof assessmentTotal === "number" &&
    assessmentTotal > 0
  ) {
    insights.push(`Assessments are ${assessmentDone}/${assessmentTotal} completed.`);
  }

  if (
    typeof contestDone === "number" &&
    typeof contestTotal === "number" &&
    contestTotal > 0
  ) {
    insights.push(`Contest performance is ${contestDone}/${contestTotal} completed questions.`);
  }

  if (assignments[0]) {
    tasks.push(
      `Finish ${truncateTitle(assignments[0].title, 72)} for ${assignments[0].subjectName}${assignments[0].dueAt ? ` by ${assignments[0].dueAt}` : ""}.`,
    );
  }

  if (lectures[0]) {
    tasks.push(`Attend the next ${lectures[0].subjectName} lecture on ${lectures[0].startsAt}.`);
  }

  if (tasks.length === 0) {
    tasks.push(`Review your latest metrics in ${scope} and focus on the next pending item.`);
  }

  return {
    summary: `Performance overview for ${scope}${insights[0] ? `: ${insights[0].replace(/\.$/, "")}` : ""}.`,
    tasks: tasks.slice(0, 3),
    insights: insights.slice(0, 3),
  };
}

function buildRankResponse(snapshot) {
  const leaderboard = snapshot.leaderboard;
  const scope =
    snapshot.context.course?.semesterName ||
    snapshot.context.course?.courseTitle ||
    getScopeLabel(snapshot);
  const currentUserEntry =
    leaderboard?.entries?.find((entry) => entry.isCurrentUser) || null;
  const topEntries = leaderboard?.entries?.slice(0, 3) || [];
  const periodLabel =
    leaderboard?.period === "weekly"
      ? "this week"
      : leaderboard?.period === "monthly"
        ? "this month"
        : "overall";

  if (!currentUserEntry) {
    return buildDataNotFoundResponse();
  }

  const studentCount = snapshot.overview?.xp?.student_count;
  const insights = [
    `Your ${periodLabel} rank is ${formatOrdinal(currentUserEntry.rank)}${studentCount ? ` out of ${studentCount}` : ""}.`,
    `You currently have ${currentUserEntry.xp} XP in ${scope}.`,
  ];
  const tasks = [];

  if (topEntries[0] && topEntries[0].rank !== currentUserEntry.rank) {
    const gapToTop = topEntries[0].xp - currentUserEntry.xp;
    insights.push(`You are ${gapToTop} XP behind rank 1.`);
  } else if (topEntries[0]) {
    insights.push("You are currently at the top of the leaderboard.");
  }

  const higherEntry = leaderboard.entries
    .filter((entry) => entry.rank < currentUserEntry.rank)
    .sort((left, right) => right.rank - left.rank)[0];

  if (higherEntry) {
    tasks.push(
      `Close the ${higherEntry.xp - currentUserEntry.xp} XP gap to ${higherEntry.name}, who is currently ${formatOrdinal(higherEntry.rank)}.`,
    );
  }

  const assignments = getRelevantAssignments(snapshot);
  if (assignments[0]) {
    tasks.push(
      `Finish ${truncateTitle(assignments[0].title, 68)}${assignments[0].dueAt ? ` by ${assignments[0].dueAt}` : ""} to keep your XP moving.`,
    );
  }

  const nextLecture = getRelevantLectures(snapshot)[0];
  if (nextLecture) {
    tasks.push(`Attend ${nextLecture.subjectName} on ${nextLecture.startsAt} to stay competitive.`);
  }

  return {
    summary: `Your ${periodLabel} class rank in ${scope} is ${formatOrdinal(currentUserEntry.rank)}${studentCount ? ` out of ${studentCount}` : ""}.`,
    tasks: tasks.slice(0, 3),
    insights: insights.slice(0, 3),
  };
}

function buildQuizResponse(snapshot) {
  const scope = getScopeLabel(snapshot);
  const collections = getRelevantAssessmentCollections(snapshot);
  const assessments = flattenAssessments(collections);

  if (assessments.length === 0) {
    return buildDataNotFoundResponse();
  }

  const latestAssessment = assessments[0];
  const completedAssessments = assessments.filter(
    (assessment) =>
      typeof assessment.earnedPoints === "number" &&
      typeof assessment.earnablePoints === "number",
  );
  const totalEarned = completedAssessments.reduce(
    (sum, assessment) => sum + assessment.earnedPoints,
    0,
  );
  const totalEarnable = completedAssessments.reduce(
    (sum, assessment) => sum + assessment.earnablePoints,
    0,
  );
  const fullScores = completedAssessments.filter(
    (assessment) => assessment.earnedPoints === assessment.earnablePoints,
  ).length;
  const tasks = [];
  const insights = ["Quizzes are tracked separately from assignments and contests."];

  if (latestAssessment.endsAt) {
    tasks.push(
      `Review ${truncateTitle(latestAssessment.title, 64)}${latestAssessment.subjectName ? ` for ${latestAssessment.subjectName}` : ""} before ${latestAssessment.endsAt}.`,
    );
  }

  if (completedAssessments[1]) {
    tasks.push(
      `Revisit ${truncateTitle(completedAssessments[1].title, 64)}${completedAssessments[1].subjectName ? ` in ${completedAssessments[1].subjectName}` : ""} to improve consistency.`,
    );
  }

  if (tasks.length === 0) {
    tasks.push(`Open the latest quiz or assessment for ${scope} and review the missed questions.`);
  }

  if (totalEarnable > 0) {
    insights.push(
      `Across ${completedAssessments.length} quizzes, you have ${totalEarned}/${totalEarnable} points overall.`,
    );
  }

  insights.push(
    `${fullScores} ${fullScores === 1 ? "quiz has" : "quizzes have"} a full score in this scope.`,
  );

  return {
    summary:
      typeof latestAssessment.earnedPoints === "number" &&
      typeof latestAssessment.earnablePoints === "number"
        ? `Your latest quiz result${latestAssessment.subjectName ? ` in ${latestAssessment.subjectName}` : ""} is ${latestAssessment.earnedPoints}/${latestAssessment.earnablePoints} in ${truncateTitle(latestAssessment.title, 68)}.`
        : `I found quiz data for ${scope}, but the latest score entry is incomplete.`,
    tasks: tasks.slice(0, 3),
    insights: insights.slice(0, 3),
  };
}

function buildCoursesResponse(snapshot) {
  const courses = snapshot.courses || [];
  const primaryCourseName = snapshot.context.primaryCourseName;
  const otherCourses = courses.filter(
    (course) => course.courseHash !== snapshot.context.course?.courseHash,
  );
  const placementCourses = courses.filter((course) =>
    /placement/i.test(`${course.courseTitle || ""} ${course.semesterName || ""}`),
  );

  if (courses.length === 0) {
    return buildDataNotFoundResponse();
  }

  return {
    summary: `You are enrolled in ${courses.length} courses${primaryCourseName ? `, and your primary course is ${primaryCourseName}` : ""}.`,
    tasks: courses.slice(0, 3).map((course) => `Open ${course.semesterName || course.courseTitle} in Newton.`),
    insights: [
      otherCourses[0]
        ? `Other enrolled courses include ${otherCourses
            .slice(0, 3)
            .map((course) => course.semesterName || course.courseTitle)
            .join(", ")}.`
        : "No other enrolled courses were returned besides the selected course.",
      placementCourses[0]
        ? `Placement-related course found: ${placementCourses[0].courseTitle}.`
        : "No separate placement course was returned in the fetched course list.",
    ].slice(0, 3),
  };
}

function buildSubjectPerformanceResponse(snapshot) {
  const progressEntries = getRelevantSubjectProgresses(snapshot);
  const scope = getScopeLabel(snapshot);

  if (progressEntries.length === 0) {
    return buildDataNotFoundResponse();
  }

  const labeledEntries = progressEntries
    .map((entry) => buildSubjectPerformanceLabel(entry))
    .filter(Boolean);

  const tasks = progressEntries
    .slice(0, 3)
    .map((entry) => `Open ${entry.subjectName} in Newton to review the latest performance breakdown.`);

  return {
    summary:
      progressEntries.length === 1
        ? `I found subject performance data for ${scope}.`
        : `I found subject-wise performance data for ${progressEntries.length} subjects in ${scope}.`,
    tasks,
    insights: labeledEntries.slice(0, 3),
  };
}

function buildCalendarResponse(snapshot) {
  const events = snapshot.calendar?.events || [];
  const scope = getScopeLabel(snapshot);

  if (events.length === 0) {
    return buildDataNotFoundResponse();
  }

  return {
    summary: `Your calendar for ${scope} has ${events.length} events in the next ${snapshot.calendar?.numberOfDays || 0} days.`,
    tasks: events
      .slice(0, 3)
      .map((event) => `Be ready for ${event.subjectName || event.title || event.type} on ${event.startsAt}.`),
    insights: [
      `The next calendar event is ${events[0].subjectName || events[0].title || events[0].type} on ${events[0].startsAt}.`,
      events[1]
        ? `The following event is ${events[1].subjectName || events[1].title || events[1].type} on ${events[1].startsAt}.`
        : null,
    ].filter(Boolean),
  };
}

function buildTimelineResponse(snapshot) {
  const recentLectures = getRelevantRecentLectures(snapshot);
  const upcomingLectures = getRelevantLectures(snapshot);
  const scope = getScopeLabel(snapshot);

  if (recentLectures.length === 0 && upcomingLectures.length === 0) {
    return buildDataNotFoundResponse();
  }

  const tasks = [];
  const insights = [];

  if (recentLectures[0]) {
    tasks.push(
      recentLectures[0].hasRecording
        ? `Review the recording for ${truncateTitle(recentLectures[0].title || recentLectures[0].subjectName, 72)}.`
        : `Review the latest lecture notes for ${recentLectures[0].subjectName}.`,
    );
    insights.push(
      `The most recent lecture was ${truncateTitle(recentLectures[0].title || recentLectures[0].subjectName, 72)} on ${recentLectures[0].startsAt}.`,
    );
  }

  if (upcomingLectures[0]) {
    tasks.push(`Prepare for ${upcomingLectures[0].subjectName} on ${upcomingLectures[0].startsAt}.`);
    insights.push(`The next scheduled lecture is ${upcomingLectures[0].subjectName} on ${upcomingLectures[0].startsAt}.`);
  }

  return {
    summary: `Your timeline for ${scope} includes ${recentLectures.length} recent lectures and ${upcomingLectures.length} upcoming lectures.`,
    tasks: tasks.slice(0, 3),
    insights: insights.slice(0, 3),
  };
}

function buildArenaResponse(snapshot) {
  const arena = snapshot.arena;
  const scope = getScopeLabel(snapshot);

  if (!arena) {
    return buildDataNotFoundResponse();
  }

  const tasks = [];

  if (arena.url) {
    tasks.push(`Open the Arena tab for ${scope} to continue practicing.`);
  }

  if (typeof arena.todaySolvedCount === "number") {
    tasks.push(`Track whether you add to today's solve count of ${arena.todaySolvedCount}.`);
  }

  return {
    summary:
      typeof arena.totalQuestions === "number" && arena.totalQuestions > 0
        ? `Your Arena progress in ${scope} is ${arena.solvedCount}/${arena.totalQuestions} solved questions (${arena.solvedPercentage}%).`
        : `Arena data is available for ${scope}, but Newton returned no practice questions in this scope.`,
    tasks: tasks.slice(0, 3),
    insights: [
      typeof arena.todaySolvedCount === "number"
        ? `You have solved ${arena.todaySolvedCount} Arena questions today.`
        : null,
      typeof arena.solvedCount === "number"
        ? `Total solved Arena questions: ${arena.solvedCount}.`
        : null,
    ].filter(Boolean),
  };
}

function buildQotdResponse(snapshot) {
  const qotd = snapshot.qotd;

  if (!qotd) {
    return buildDataNotFoundResponse();
  }

  return {
    summary: `Today's Question of the Day is ${qotd.title}. Your current streak is ${qotd.currentStreak}.`,
    tasks: qotd.url ? [`Open today's QOTD in Newton: ${qotd.title}.`] : [],
    insights: [
      typeof qotd.longestStreak === "number"
        ? `Your longest QOTD streak is ${qotd.longestStreak}.`
        : null,
      typeof qotd.streakLives === "number"
        ? `You currently have ${qotd.streakLives} streak lives left.`
        : null,
      typeof qotd.completedCount === "number" && typeof qotd.attemptedCount === "number"
        ? `${qotd.completedCount}/${qotd.attemptedCount} attempted submissions are marked completed for today's QOTD.`
        : null,
    ].filter(Boolean),
  };
}

function buildExpertSessionsResponse(snapshot) {
  const candidates = [
    ...(snapshot.calendar?.events || []),
    ...(snapshot.recentLectures?.lectures || []),
    ...(snapshot.schedule?.upcomingLectures || []),
  ].filter((item) =>
    /expert/i.test(`${item.title || ""} ${item.subjectName || ""} ${item.type || ""}`),
  );

  if (candidates.length === 0) {
    return buildDataNotFoundResponse();
  }

  return {
    summary: `I found ${formatCountLabel(candidates.length, "expert session", "expert sessions")} in the fetched Newton data.`,
    tasks: candidates
      .slice(0, 3)
      .map((item) => `Open ${item.title || item.subjectName || "the expert session"} in Newton.`),
    insights: candidates
      .slice(0, 3)
      .map((item) => `${item.title || item.subjectName || "Expert session"}${item.startsAt ? ` starts on ${item.startsAt}` : ""}.`),
  };
}

function buildTodayResponse(snapshot) {
  const assignments = getRelevantAssignments(snapshot);
  const lectures = getRelevantLectures(snapshot);
  const scope = getScopeLabel(snapshot);
  const { todayKey, tomorrowKey, todayLabel, tomorrowLabel } = getTodayContext();
  const todaysAssignments = assignments.filter((assignment) =>
    isSameDate(assignment.dueTimestamp, todayKey),
  );
  const todaysLectures = lectures.filter((lecture) =>
    isSameDate(lecture.startTimestamp, todayKey),
  );
  const tomorrowsAssignments = assignments.filter((assignment) =>
    isSameDate(assignment.dueTimestamp, tomorrowKey),
  );
  const tomorrowsLectures = lectures.filter((lecture) =>
    isSameDate(lecture.startTimestamp, tomorrowKey),
  );
  const tasks = [];
  const insights = [];

  if (todaysAssignments[0]) {
    tasks.push(
      `Finish ${truncateTitle(todaysAssignments[0].title, 72)} for ${todaysAssignments[0].subjectName}${todaysAssignments[0].dueAt ? ` by ${todaysAssignments[0].dueAt}` : ""}.`,
    );
    insights.push(`${formatCountLabel(todaysAssignments.length, "assignment is", "assignments are")} due today.`);
  }

  if (todaysLectures[0]) {
    tasks.push(`Prepare for ${todaysLectures[0].subjectName} on ${todaysLectures[0].startsAt}.`);
    insights.push(`${formatCountLabel(todaysLectures.length, "lecture is", "lectures are")} scheduled today.`);
  }

  if (tasks.length === 0 && tomorrowsAssignments[0]) {
    tasks.push(
      `Start ${truncateTitle(tomorrowsAssignments[0].title, 72)} for ${tomorrowsAssignments[0].subjectName}${tomorrowsAssignments[0].dueAt ? ` before ${tomorrowsAssignments[0].dueAt}` : ""}.`,
    );
    insights.push(`There are no assignment deadlines today, so the nearest deadline is on ${tomorrowLabel}.`);
  }

  if (tasks.length < 2 && tomorrowsLectures[0]) {
    tasks.push(`Prepare for ${tomorrowsLectures[0].subjectName} on ${tomorrowsLectures[0].startsAt}.`);
    insights.push(`Your next lecture is on ${tomorrowLabel}.`);
  }

  if (tasks.length < 3 && assignments[0] && !tasks.some((task) => task.includes(assignments[0].subjectName))) {
    tasks.push(
      `Plan ahead for ${truncateTitle(assignments[0].title, 64)}${assignments[0].dueAt ? ` due ${assignments[0].dueAt}` : ""}.`,
    );
  }

  if (!insights.some((insight) => insight.includes("upcoming"))) {
    insights.push(`${formatCountLabel(lectures.length, "upcoming lecture", "upcoming lectures")} are scheduled in the next 7 days.`);
  }

  const performance = snapshot.overview?.performance;

  if (
    !snapshot.context.subject &&
    typeof performance?.lectures_attended === "number" &&
    typeof performance?.total_lectures === "number" &&
    performance.total_lectures > 0
  ) {
    insights.push(
      `Attendance is ${performance.lectures_attended}/${performance.total_lectures} (${formatPercentage(performance.lectures_attended, performance.total_lectures)}).`,
    );
  }

  if (tasks.length === 0) {
    tasks.push(`Review the next lecture and any newly opened work for ${scope}.`);
  }

  if (insights.length === 0) {
    insights.push(`This response is based on the latest Newton data available for ${scope}.`);
  }

  return {
    summary:
      tasks.length > 0 && (todaysAssignments.length > 0 || todaysLectures.length > 0)
        ? `Your priorities for ${todayLabel} in ${scope} are based on today's due work and class schedule.`
        : `There is no urgent work scheduled for ${todayLabel} in ${scope}, so your best move is to prepare for ${tomorrowLabel}.`,
    tasks: tasks.slice(0, 3),
    insights: insights.slice(0, 3),
  };
}

export function buildAcademicReasoningPrompt(
  query,
  { snapshotRecord = null, snapshot = null } = {},
) {
  const payload = snapshotRecord
    ? {
        mode: "stored-record",
        id: snapshotRecord?.id || null,
        query: snapshotRecord?.query || null,
        intent: snapshotRecord?.intent || null,
        source: snapshotRecord?.source || null,
        toolsUsed: snapshotRecord?.tools_used || [],
        snapshot: snapshotRecord?.snapshot || null,
      }
    : {
        mode: "in-memory-snapshot",
        query,
        intent: snapshot?.intent || null,
        source: snapshot?.source || null,
        toolsUsed: snapshot?.toolsUsed || [],
        snapshot,
      };

  return [
    "You are a JSON-only academic assistant.",
    "Academic data was fetched from Newton MCP by the backend before this reasoning step.",
    snapshotRecord
      ? "A stored Supabase record is provided below."
      : "Supabase persistence is unavailable, so the in-memory academic snapshot is provided below.",
    "You are reasoning ONLY over the academic data payload provided below.",
    "Do NOT fetch tools, do NOT assume missing data, and do NOT use general knowledge.",
    "Use ONLY the provided academic data.",
    "Keep contests separate from assignments.",
    "Keep quizzes and assessments separate from both assignments and contests.",
    "Return 1 concise summary sentence.",
    "Return 0 or more actionable tasks.",
    "Return 2 to 4 concise insights whenever the academic data contains useful signals.",
    "Insights must be short academic observations, not repeats of the summary and not phrased as tasks.",
    "Good insight themes include deadline urgency, workload concentration, weak subject signals, progress patterns, missed class implications, and priority suggestions.",
    "If the provided data does not contain the requested information, return exactly {\"summary\":\"Data not found\",\"tasks\":[],\"insights\":[]}.",
    "If the provided data indicates a failure, return exactly {\"error\":\"MCP tool failed\"}.",
    "Respond with ONLY valid JSON.",
    "Do not include markdown, code fences, comments, or any explanation outside the JSON object.",
    "Return exactly one of these shapes: {\"summary\":\"\",\"tasks\":[],\"insights\":[]} or {\"error\":\"\"}",
    "",
    "Academic payload:",
    JSON.stringify(payload, null, 2),
    "",
    `User query: ${query}`,
  ].join("\n");
}

export function buildStoredNewtonPrompt(query, snapshotRecord) {
  return buildAcademicReasoningPrompt(query, { snapshotRecord });
}

export async function getNewtonSnapshot(query) {
  const client = new NewtonMcpClient();

  try {
    await client.initialize();

    const courseData = await client.callTool("list_courses");
    const context = resolveCourseContext(courseData, query);
    const intent = detectIntent(query);
    const leaderboardPeriod = getLeaderboardPeriod(query);
    const toolsUsed = ["list_courses"];
    const courseHash = context.course?.course_hash || courseData?.primary_course_hash || null;
    const courseSubjects = Array.isArray(context.course?.subjects)
      ? context.course.subjects
      : [];

    let overview = null;
    let assignments = null;
    let schedule = null;
    let leaderboard = null;
    let assessments = [];
    let subjectProgresses = [];
    let calendar = null;
    let recentLectures = null;
    let arena = null;
    let qotd = null;
    let qotdHistory = null;

    if (
      courseHash &&
      (intent === "attendance" ||
        intent === "performance" ||
        intent === "rank" ||
        intent === "contests" ||
        intent === "today" ||
        Boolean(context.subject))
    ) {
      overview = simplifyOverview(
        await client.callTool("get_course_overview", { course_hash: courseHash }),
      );
      toolsUsed.push("get_course_overview");
    }

    if (
      courseHash &&
      (intent === "assignments" ||
        intent === "today" ||
        intent === "rank" ||
        intent === "performance" ||
        intent === "schedule" ||
        intent === "contests")
    ) {
      assignments = simplifyAssignments(
        await client.callTool("get_assignments", {
          course_hash: courseHash,
          limit: 10,
          ...(context.subject ? { subject_hash: context.subject.subject_hash } : {}),
        }),
      );
      toolsUsed.push("get_assignments");
    }

    if (
      courseHash &&
      (intent === "attendance" ||
        intent === "today" ||
        intent === "rank" ||
        intent === "next_class" ||
        intent === "performance" ||
        intent === "schedule" ||
        intent === "calendar" ||
        intent === "timeline" ||
        intent === "expert_sessions" ||
        intent === "contests")
    ) {
      schedule = simplifySchedule(
        await client.callTool("get_upcoming_schedule", {
          course_hash: courseHash,
          days: 7,
        }),
      );
      toolsUsed.push("get_upcoming_schedule");
    }

    if (courseHash && (context.subject || intent === "subject_performance")) {
      const subjectsToFetch = context.subject ? [context.subject] : courseSubjects;

      for (const subject of subjectsToFetch) {
        subjectProgresses.push(
          simplifySubjectProgress(
            subject,
            await client.callTool("get_subject_progress", {
              course_hash: courseHash,
              subject_hash: subject.subject_hash,
            }),
          ),
        );
      }

      if (subjectsToFetch.length > 0) {
        toolsUsed.push("get_subject_progress");
      }
    }

    if (courseHash && (intent === "rank" || intent === "performance")) {
      leaderboard = simplifyLeaderboard(
        await client.callTool("get_leaderboard", {
          course_hash: courseHash,
          period: leaderboardPeriod,
          limit: 200,
        }),
      );
      toolsUsed.push("get_leaderboard");
    }

    if (courseHash && intent === "quizzes") {
      const subjectsToFetch = context.subject ? [context.subject] : courseSubjects;

      for (const subject of subjectsToFetch) {
        assessments.push(
          simplifyAssessmentCollection(
            subject,
            await client.callTool("get_assessments", {
              course_hash: courseHash,
              subject_hash: subject.subject_hash,
            }),
          ),
        );
      }

      if (subjectsToFetch.length > 0) {
        toolsUsed.push("get_assessments");
      }
    }

    if (courseHash && (intent === "calendar" || intent === "timeline" || intent === "expert_sessions")) {
      calendar = simplifyCalendar(
        await client.callTool("get_calendar", {
          course_hash: courseHash,
          number_of_days: 7,
        }),
      );
      toolsUsed.push("get_calendar");
    }

    if (courseHash && (intent === "timeline" || intent === "expert_sessions")) {
      recentLectures = simplifyRecentLectures(
        await client.callTool("get_recent_lectures", {
          course_hash: courseHash,
          limit: 5,
        }),
      );
      toolsUsed.push("get_recent_lectures");
    }

    if (courseHash && intent === "arena") {
      arena = simplifyArenaStats(
        await client.callTool("get_arena_stats", { course_hash: courseHash }),
      );
      toolsUsed.push("get_arena_stats");
    }

    if (courseHash && intent === "qotd") {
      qotd = simplifyQuestionOfTheDay(
        await client.callTool("get_question_of_the_day", { course_hash: courseHash }),
      );
      qotdHistory = simplifyQotdHistory(
        await client.callTool("get_qotd_history", {
          course_hash: courseHash,
          include_leaderboard: true,
        }),
      );
      toolsUsed.push("get_question_of_the_day");
      toolsUsed.push("get_qotd_history");
    }

    return {
      source: "newton-mcp",
      intent,
      query,
      toolsUsed,
      courses: simplifyCourseCatalog(courseData),
      context: {
        matchedBy: context.matchedBy,
        primaryCourseName: courseData?.primary_course_name || null,
        course: simplifyCourse(context.course),
        subject: simplifySubject(context.subject),
      },
      overview,
      subjectProgresses,
      attendance: simplifyAttendance(context, overview, subjectProgresses),
      assignments,
      schedule,
      leaderboard,
      assessments,
      calendar,
      recentLectures,
      arena,
      qotd,
      qotdHistory,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Newton MCP request failed.";

    if (/Authentication required/i.test(message)) {
      throw new Error(
        `Newton MCP authentication is required. Run \`${NEWTON_LOGIN_COMMAND}\` and retry.`,
      );
    }

    if (
      /command not found|not recognized|enoent|could not determine executable|npm error|npx/i.test(
        message,
      )
    ) {
      throw new Error(
        `Newton MCP is not available locally. Add it to Codex with \`${NEWTON_CODEX_SETUP_COMMAND}\`, then retry.`,
      );
    }

    throw new Error(`Newton data request failed. ${message}`);
  } finally {
    client.close();
  }
}
