module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/lib/claude.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "askClaude",
    ()=>askClaude
]);
;
const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_CLAUDE_MODEL = "claude-sonnet-4-6";
async function askClaude(query) {
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
    const model = process.env.ANTHROPIC_MODEL || process.env.CLAUDE_MODEL || DEFAULT_CLAUDE_MODEL;
    if (!apiKey) {
        throw new Error("Missing ANTHROPIC_API_KEY or CLAUDE_API_KEY environment variable.");
    }
    if (!query || typeof query !== "string") {
        throw new Error("askClaude requires a non-empty string query.");
    }
    const response = await fetch(CLAUDE_API_URL, {
        method: "POST",
        cache: "no-store",
        headers: {
            "content-type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
            model,
            max_tokens: 1024,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: query
                        }
                    ]
                }
            ]
        })
    });
    const data = await response.json();
    if (!response.ok) {
        const message = data?.error?.message || "Claude API request failed.";
        throw new Error(message);
    }
    const text = data.content?.filter((block)=>block.type === "text").map((block)=>block.text).join("\n").trim();
    if (!text) {
        throw new Error("Claude API returned no text content.");
    }
    return text;
}
}),
"[externals]/node:child_process [external] (node:child_process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:child_process", () => require("node:child_process"));

module.exports = mod;
}),
"[project]/lib/newton-mcp.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildLocalNewtonResponse",
    ()=>buildLocalNewtonResponse,
    "buildNewtonPrompt",
    ()=>buildNewtonPrompt,
    "getNewtonSnapshot",
    ()=>getNewtonSnapshot
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$child_process__$5b$external$5d$__$28$node$3a$child_process$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:child_process [external] (node:child_process, cjs)");
;
;
const MCP_PROTOCOL_VERSION = "2025-03-26";
const MCP_CLIENT_INFO = {
    name: "academos",
    version: "0.1.0"
};
const NEWTON_COMMAND = "npx";
const NEWTON_ARGS = [
    "-y",
    "@newtonschool/newton-mcp@latest"
];
const REQUEST_TIMEOUT_MS = 30000;
function normalizeText(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
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
        timeZone: "Asia/Kolkata"
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
        timeZone: "Asia/Kolkata"
    }).format(date);
}
function formatPercentage(attended, total) {
    if (!total) {
        return null;
    }
    return `${(attended / total * 100).toFixed(1)}%`;
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
        day: "2-digit"
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
        const text = result?.content?.find((item)=>item.type === "text")?.text;
        throw new Error(text || "Newton MCP tool call failed.");
    }
    const text = result?.content?.find((item)=>item.type === "text")?.text;
    if (!text) {
        throw new Error("Newton MCP returned no text payload.");
    }
    try {
        return JSON.parse(text);
    } catch  {
        throw new Error("Newton MCP returned invalid JSON.");
    }
}
class NewtonMcpClient {
    constructor(){
        this.child = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$child_process__$5b$external$5d$__$28$node$3a$child_process$2c$__cjs$29$__["spawn"])(NEWTON_COMMAND, NEWTON_ARGS, {
            stdio: [
                "pipe",
                "pipe",
                "pipe"
            ]
        });
        this.nextId = 1;
        this.buffer = "";
        this.pending = new Map();
        this.stderr = "";
        this.child.stdout.on("data", (chunk)=>{
            this.buffer += chunk.toString();
            while(true){
                const newlineIndex = this.buffer.indexOf("\n");
                if (newlineIndex === -1) {
                    return;
                }
                const line = this.buffer.slice(0, newlineIndex).trim();
                this.buffer = this.buffer.slice(newlineIndex + 1);
                if (!line) {
                    continue;
                }
                const message = JSON.parse(line);
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
        this.child.stderr.on("data", (chunk)=>{
            this.stderr += chunk.toString();
        });
        this.child.on("exit", (code)=>{
            if (code === 0) {
                return;
            }
            const detail = this.stderr.trim();
            for (const { reject, timeoutId } of this.pending.values()){
                clearTimeout(timeoutId);
                reject(new Error(detail ? `Newton MCP exited with code ${code}: ${detail}` : `Newton MCP exited with code ${code}.`));
            }
            this.pending.clear();
        });
    }
    send(message) {
        this.child.stdin.write(`${JSON.stringify(message)}\n`);
    }
    request(method, params = {}) {
        return new Promise((resolve, reject)=>{
            const id = this.nextId++;
            const timeoutId = setTimeout(()=>{
                this.pending.delete(id);
                reject(new Error(`Newton MCP request timed out for ${method}.`));
            }, REQUEST_TIMEOUT_MS);
            this.pending.set(id, {
                resolve,
                reject,
                timeoutId
            });
            this.send({
                jsonrpc: "2.0",
                id,
                method,
                params
            });
        });
    }
    notify(method, params = {}) {
        this.send({
            jsonrpc: "2.0",
            method,
            params
        });
    }
    async initialize() {
        await this.request("initialize", {
            protocolVersion: MCP_PROTOCOL_VERSION,
            capabilities: {},
            clientInfo: MCP_CLIENT_INFO
        });
        this.notify("notifications/initialized");
    }
    async callTool(name, args = {}) {
        const result = await this.request("tools/call", {
            name,
            arguments: args
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
    return [
        ...aliases
    ];
}
function resolveCourseContext(courseData, query) {
    const courses = Array.isArray(courseData?.courses) ? courseData.courses : [];
    const normalizedQuery = normalizeText(query);
    const primaryCourse = courses.find((course)=>course.course_hash === courseData?.primary_course_hash) || courses.find((course)=>course.is_primary) || courses[0] || null;
    let bestSubjectMatch = null;
    for (const course of courses){
        for (const subject of course.subjects || []){
            for (const alias of extractSubjectAliases(subject.subject_name)){
                if (!matchesAlias(normalizedQuery, alias)) {
                    continue;
                }
                const score = normalizeText(alias).length;
                if (!bestSubjectMatch || score > bestSubjectMatch.score) {
                    bestSubjectMatch = {
                        course,
                        subject,
                        score
                    };
                }
            }
        }
    }
    if (bestSubjectMatch) {
        return {
            course: bestSubjectMatch.course,
            subject: bestSubjectMatch.subject,
            matchedBy: "subject",
            primaryCourse
        };
    }
    let bestCourseMatch = null;
    for (const course of courses){
        const aliases = [
            course.semester_name,
            course.course_title
        ].filter(Boolean);
        for (const alias of aliases){
            if (!matchesAlias(normalizedQuery, alias)) {
                continue;
            }
            const score = normalizeText(alias).length;
            if (!bestCourseMatch || score > bestCourseMatch.score) {
                bestCourseMatch = {
                    course,
                    score
                };
            }
        }
    }
    return {
        course: bestCourseMatch?.course || primaryCourse,
        subject: null,
        matchedBy: bestCourseMatch ? "course" : "primary",
        primaryCourse
    };
}
function detectIntent(query) {
    const normalizedQuery = normalizeText(query);
    const asksAttendance = /\battendance\b|\battend\b/.test(normalizedQuery);
    const asksAssignments = /\bassignment\b|\bassignments\b|\bpending\b|\bdue\b|\bhomework\b|\bsubmission\b|\bsubmissions\b|\bcontest\b|\bcontests\b/.test(normalizedQuery);
    const asksNextClass = /\bnext class\b|\bnext lecture\b|\bwhen is my next class\b|\bwhen is the next class\b/.test(normalizedQuery);
    const asksSchedule = /\bschedule\b|\btimetable\b|\bcoming up\b|\bupcoming\b|\bclasses this week\b|\bwhat do i have\b|\bwhat classes do i have\b/.test(normalizedQuery);
    const asksScore = /\bscore\b|\bscores\b|\bmarks\b|\bmark\b|\bquiz\b|\bquizzes\b|\bassessment\b|\bassessments\b|\bmcq\b|\bresult\b|\bresults\b|\btest score\b/.test(normalizedQuery);
    const asksRank = /\brank\b|\bleaderboard\b|\bposition\b|\bwhere do i stand\b|\bclass rank\b|\btopper\b/.test(normalizedQuery);
    const asksPerformance = /how am i doing|\bprogress\b|\bperformance\b|\bdoing in\b|\bmy stats\b|\bmy rank\b|\bxp\b|\blevel\b/.test(normalizedQuery);
    const asksToday = /\btoday\b|what should i do|plan for today|focus today|what should i focus on|tomorrow/.test(normalizedQuery);
    if (asksAttendance && !asksAssignments && !asksToday) {
        return "attendance";
    }
    if (asksAssignments && !asksToday) {
        return "assignments";
    }
    if (asksScore) {
        return "score";
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
        isOngoingSemester: Boolean(course.is_ongoing_semester)
    };
}
function simplifySubject(subject) {
    if (!subject) {
        return null;
    }
    return {
        subjectHash: subject.subject_hash,
        subjectName: subject.subject_name
    };
}
function simplifyAssignments(payload) {
    if (!payload) {
        return null;
    }
    return {
        assignments: Array.isArray(payload.assignments) ? payload.assignments.map((assignment)=>({
                subjectName: assignment.subject_name,
                title: assignment.title,
                dueAt: formatDateTime(assignment.end_timestamp),
                dueTimestamp: assignment.end_timestamp,
                totalQuestions: assignment.total_questions,
                url: assignment.url
            })) : [],
        contests: Array.isArray(payload.contests) ? payload.contests.map((contest)=>({
                subjectName: contest.subject_name,
                title: contest.title,
                dueAt: formatDateTime(contest.end_timestamp),
                dueTimestamp: contest.end_timestamp,
                totalQuestions: contest.total_questions,
                url: contest.url
            })) : []
    };
}
function simplifySchedule(payload) {
    if (!payload) {
        return null;
    }
    return {
        upcomingLectures: Array.isArray(payload.upcoming_lectures) ? payload.upcoming_lectures.map((lecture)=>({
                subjectHash: lecture.subject_hash,
                subjectName: lecture.subject_name,
                startsAt: formatDateTime(lecture.start_timestamp),
                startTimestamp: lecture.start_timestamp,
                endsAt: formatDateTime(lecture.end_timestamp),
                type: lecture.type,
                url: lecture.url
            })) : [],
        upcomingContests: Array.isArray(payload.upcoming_contests) ? payload.upcoming_contests.map((contest)=>({
                subjectName: contest.subject_name,
                startsAt: formatDateTime(contest.start_timestamp),
                startTimestamp: contest.start_timestamp,
                endsAt: formatDateTime(contest.end_timestamp),
                title: contest.title,
                url: contest.url
            })) : []
    };
}
function simplifyOverview(payload) {
    if (!payload) {
        return null;
    }
    return {
        courseTitle: payload.course_title,
        performance: payload.performance || null,
        xp: payload.xp || null
    };
}
function simplifyLeaderboard(payload) {
    if (!payload) {
        return null;
    }
    return {
        period: payload.period || "overall",
        entries: Array.isArray(payload.entries) ? payload.entries.map((entry)=>({
                name: entry.name,
                rank: entry.rank,
                xp: entry.xp,
                isCurrentUser: Boolean(entry.is_current_user)
            })) : [],
        url: payload.url || null
    };
}
function simplifyAssessments(payload) {
    if (!payload) {
        return null;
    }
    return {
        assessments: Array.isArray(payload.assessments) ? payload.assessments.map((assessment)=>({
                title: assessment.title,
                earnedPoints: assessment.earned_points,
                earnablePoints: assessment.earnable_points,
                startsAt: formatDateTime(assessment.start_timestamp),
                endsAt: formatDateTime(assessment.end_timestamp),
                endTimestamp: assessment.end_timestamp,
                url: assessment.url
            })) : []
    };
}
function getRelevantLectures(snapshot) {
    const lectures = snapshot.schedule?.upcomingLectures || [];
    const subjectHash = snapshot.context.subject?.subjectHash;
    if (!subjectHash) {
        return lectures;
    }
    return lectures.filter((lecture)=>lecture.subjectHash === subjectHash);
}
function getRelevantAssignments(snapshot) {
    const assignments = snapshot.assignments?.assignments || [];
    const subjectName = snapshot.context.subject?.subjectName;
    if (!subjectName) {
        return assignments;
    }
    return assignments.filter((assignment)=>assignment.subjectName === subjectName);
}
function getScopeLabel(snapshot) {
    return snapshot.context.subject?.subjectName || snapshot.context.course?.semesterName || snapshot.context.course?.courseTitle || "your course";
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
        tomorrowLabel: formatDateOnly(tomorrow)
    };
}
function buildAttendanceResponse(snapshot) {
    const performance = snapshot.overview?.performance;
    const attended = performance?.lectures_attended;
    const total = performance?.total_lectures;
    const scope = getScopeLabel(snapshot);
    if (typeof attended !== "number" || typeof total !== "number" || total === 0) {
        return {
            summary: `I could not find lecture attendance data for ${scope}.`,
            tasks: [
                `Open ${scope} in Newton and confirm the subject mapping if you expected attendance data here.`
            ],
            insights: [
                "Newton returned no usable lecture attendance totals for this request."
            ]
        };
    }
    const percentage = formatPercentage(attended, total);
    const missed = Math.max(total - attended, 0);
    const nextLecture = getRelevantLectures(snapshot)[0] || null;
    const tasks = [];
    const insights = [
        `${scope} attendance is ${attended}/${total} lectures (${percentage}).`,
        `You have missed ${formatCountLabel(missed, "lecture", "lectures")} in this scope.`
    ];
    if (nextLecture?.startsAt) {
        tasks.push(`Attend the next ${nextLecture.subjectName} lecture on ${nextLecture.startsAt}.`);
        insights.push(`Your next relevant lecture is on ${nextLecture.startsAt}.`);
    }
    if (attended / total * 100 < 75) {
        tasks.push("Prioritize every upcoming lecture in this subject until your attendance recovers.");
    } else if (attended / total * 100 < 90) {
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
        insights: insights.slice(0, 3)
    };
}
function buildAssignmentsResponse(snapshot) {
    const assignments = getRelevantAssignments(snapshot);
    const scope = getScopeLabel(snapshot);
    if (assignments.length === 0) {
        return {
            summary: `I could not find any pending assignments for ${scope}.`,
            tasks: [
                "Check your upcoming schedule to prepare for the next lecture block."
            ],
            insights: [
                "Newton returned no pending assignments for this request."
            ]
        };
    }
    const nextAssignment = assignments[0];
    const tasks = assignments.slice(0, 3).map((assignment)=>{
        const dueText = assignment.dueAt ? ` by ${assignment.dueAt}` : "";
        return `Complete ${truncateTitle(assignment.title)} for ${assignment.subjectName}${dueText}.`;
    });
    const insights = [
        `${formatCountLabel(assignments.length, "assignment is", "assignments are")} currently pending for ${scope}.`,
        `The nearest pending item is ${truncateTitle(nextAssignment.title, 72)}${nextAssignment.dueAt ? ` due ${nextAssignment.dueAt}` : ""}.`
    ];
    if (snapshot.overview?.performance?.completed_assignment_questions !== undefined) {
        const completed = snapshot.overview.performance.completed_assignment_questions;
        const total = snapshot.overview.performance.total_assignment_questions;
        if (typeof completed === "number" && typeof total === "number" && total > 0) {
            insights.push(`Assignment progress stands at ${completed}/${total} completed questions.`);
        }
    }
    return {
        summary: `You have ${assignments.length} pending assignments in ${scope}, and the nearest one is ${truncateTitle(nextAssignment.title, 72)}.`,
        tasks,
        insights: insights.slice(0, 3)
    };
}
function buildNextClassResponse(snapshot) {
    const lectures = getRelevantLectures(snapshot);
    const scope = getScopeLabel(snapshot);
    const nextLecture = lectures[0];
    if (!nextLecture) {
        return {
            summary: `I could not find an upcoming class for ${scope}.`,
            tasks: [
                `Open your Newton schedule for ${scope} to confirm if new lectures have been published.`
            ],
            insights: [
                "Newton returned no upcoming lecture entries for this request."
            ]
        };
    }
    return {
        summary: `Your next class${snapshot.context.subject ? ` in ${scope}` : ""} is ${nextLecture.subjectName} on ${nextLecture.startsAt}.`,
        tasks: [
            `Be ready for ${nextLecture.subjectName} by ${nextLecture.startsAt}.`,
            `Review the last notes or pending work for ${nextLecture.subjectName} before class starts.`
        ],
        insights: [
            `The next scheduled lecture is ${nextLecture.subjectName}.`,
            `${formatCountLabel(lectures.length, "lecture is", "lectures are")} scheduled in the next 7 days for this scope.`
        ]
    };
}
function buildScheduleResponse(snapshot) {
    const lectures = getRelevantLectures(snapshot);
    const assignments = getRelevantAssignments(snapshot);
    const scope = getScopeLabel(snapshot);
    if (lectures.length === 0 && assignments.length === 0) {
        return {
            summary: `I could not find upcoming schedule items for ${scope}.`,
            tasks: [
                `Recheck your Newton calendar for ${scope} in case the schedule was updated recently.`
            ],
            insights: [
                "Newton returned no upcoming lectures or assignment items for this request."
            ]
        };
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
        tasks.push(`Complete ${truncateTitle(assignments[0].title, 72)} for ${assignments[0].subjectName}${assignments[0].dueAt ? ` by ${assignments[0].dueAt}` : ""}.`);
        insights.push(`The nearest assignment deadline is ${truncateTitle(assignments[0].title, 60)}.`);
    }
    return {
        summary: `Your upcoming schedule for ${scope} starts with ${lectures[0] ? `${lectures[0].subjectName} on ${lectures[0].startsAt}` : "an assignment deadline"}.`,
        tasks: tasks.slice(0, 3),
        insights: [
            ...insights,
            `${formatCountLabel(lectures.length, "lecture is", "lectures are")} scheduled in the next 7 days.`
        ].slice(0, 3)
    };
}
function buildPerformanceResponse(snapshot) {
    const scope = getScopeLabel(snapshot);
    const performance = snapshot.overview?.performance;
    const assignments = getRelevantAssignments(snapshot);
    const lectures = getRelevantLectures(snapshot);
    if (!performance) {
        return {
            summary: `I could not find performance data for ${scope}.`,
            tasks: [
                `Open ${scope} in Newton and check whether that subject exposes overview metrics.`
            ],
            insights: [
                "Newton returned no performance overview for this request."
            ]
        };
    }
    const attended = performance.lectures_attended;
    const totalLectures = performance.total_lectures;
    const assignmentDone = performance.completed_assignment_questions;
    const assignmentTotal = performance.total_assignment_questions;
    const assessmentDone = performance.completed_assessments;
    const assessmentTotal = performance.total_assessments;
    const insights = [];
    const tasks = [];
    if (typeof attended === "number" && typeof totalLectures === "number" && totalLectures > 0) {
        insights.push(`Attendance is ${attended}/${totalLectures} (${formatPercentage(attended, totalLectures)}).`);
    }
    if (typeof assignmentDone === "number" && typeof assignmentTotal === "number" && assignmentTotal > 0) {
        insights.push(`Assignment progress is ${assignmentDone}/${assignmentTotal} completed questions.`);
    }
    if (typeof assessmentDone === "number" && typeof assessmentTotal === "number" && assessmentTotal > 0) {
        insights.push(`Assessments are ${assessmentDone}/${assessmentTotal} completed.`);
    }
    if (assignments[0]) {
        tasks.push(`Finish ${truncateTitle(assignments[0].title, 72)} for ${assignments[0].subjectName}${assignments[0].dueAt ? ` by ${assignments[0].dueAt}` : ""}.`);
    }
    if (lectures[0]) {
        tasks.push(`Attend the next ${lectures[0].subjectName} lecture on ${lectures[0].startsAt}.`);
    }
    if (tasks.length === 0) {
        tasks.push(`Review your latest metrics in ${scope} and focus on the next pending item.`);
    }
    return {
        summary: `You are doing reasonably well in ${scope}${insights[0] ? `: ${insights[0].replace(/\.$/, "")}` : ""}.`,
        tasks: tasks.slice(0, 3),
        insights: insights.slice(0, 3)
    };
}
function buildRankResponse(snapshot) {
    const leaderboard = snapshot.leaderboard;
    const scope = snapshot.context.course?.semesterName || snapshot.context.course?.courseTitle || getScopeLabel(snapshot);
    const currentUserEntry = leaderboard?.entries?.find((entry)=>entry.isCurrentUser) || null;
    const topEntries = leaderboard?.entries?.slice(0, 3) || [];
    const periodLabel = leaderboard?.period === "weekly" ? "this week" : leaderboard?.period === "monthly" ? "this month" : "overall";
    if (!currentUserEntry) {
        return {
            summary: `I could not find your class rank for ${scope}.`,
            tasks: [
                "Open the Newton leaderboard tab and confirm your current ranking if you expected it here."
            ],
            insights: [
                "Newton returned leaderboard data, but your own entry was not present in the fetched results."
            ]
        };
    }
    const studentCount = snapshot.overview?.xp?.student_count;
    const insights = [
        `Your ${periodLabel} rank is ${formatOrdinal(currentUserEntry.rank)}${studentCount ? ` out of ${studentCount}` : ""}.`,
        `You currently have ${currentUserEntry.xp} XP in ${scope}.`
    ];
    const tasks = [];
    if (topEntries[0] && topEntries[0].rank !== currentUserEntry.rank) {
        const gapToTop = topEntries[0].xp - currentUserEntry.xp;
        insights.push(`You are ${gapToTop} XP behind rank 1.`);
    } else if (topEntries[0]) {
        insights.push("You are currently at the top of the leaderboard.");
    }
    const higherEntry = leaderboard.entries.filter((entry)=>entry.rank < currentUserEntry.rank).sort((left, right)=>right.rank - left.rank)[0];
    if (higherEntry) {
        tasks.push(`Close the ${higherEntry.xp - currentUserEntry.xp} XP gap to ${higherEntry.name}, who is currently ${formatOrdinal(higherEntry.rank)}.`);
    }
    const assignments = getRelevantAssignments(snapshot);
    if (assignments[0]) {
        tasks.push(`Finish ${truncateTitle(assignments[0].title, 68)}${assignments[0].dueAt ? ` by ${assignments[0].dueAt}` : ""} to keep your XP moving.`);
    }
    const nextLecture = getRelevantLectures(snapshot)[0];
    if (nextLecture) {
        tasks.push(`Attend ${nextLecture.subjectName} on ${nextLecture.startsAt} to stay competitive.`);
    }
    return {
        summary: `Your ${periodLabel} class rank in ${scope} is ${formatOrdinal(currentUserEntry.rank)}${studentCount ? ` out of ${studentCount}` : ""}.`,
        tasks: tasks.slice(0, 3),
        insights: insights.slice(0, 3)
    };
}
function buildScoreResponse(snapshot) {
    const scope = getScopeLabel(snapshot);
    const assessments = snapshot.assessments?.assessments || [];
    if (!snapshot.context.subject) {
        return {
            summary: "I need a specific subject to answer score questions accurately.",
            tasks: [
                "Ask about a subject directly, for example: 'What is my score in DVA?' or 'What are my quiz scores in SD?'"
            ],
            insights: [
                "Newton assessment scores are subject-specific, so a course-wide score query is ambiguous."
            ]
        };
    }
    if (assessments.length === 0) {
        return {
            summary: `I could not find assessment scores for ${scope}.`,
            tasks: [
                `Open ${scope} in Newton and check whether assessments are available for that subject.`
            ],
            insights: [
                "Newton returned no assessment entries for this subject."
            ]
        };
    }
    const latestAssessment = assessments[0];
    const completedAssessments = assessments.filter((assessment)=>typeof assessment.earnedPoints === "number" && typeof assessment.earnablePoints === "number");
    const totalEarned = completedAssessments.reduce((sum, assessment)=>sum + assessment.earnedPoints, 0);
    const totalEarnable = completedAssessments.reduce((sum, assessment)=>sum + assessment.earnablePoints, 0);
    const fullScores = completedAssessments.filter((assessment)=>assessment.earnedPoints === assessment.earnablePoints).length;
    const summary = typeof latestAssessment.earnedPoints === "number" && typeof latestAssessment.earnablePoints === "number" ? `Your latest recorded score in ${scope} is ${latestAssessment.earnedPoints}/${latestAssessment.earnablePoints} in ${truncateTitle(latestAssessment.title, 68)}.` : `I found assessment data for ${scope}, but the latest score entry is incomplete.`;
    const tasks = [];
    if (latestAssessment.endsAt) {
        tasks.push(`Review ${truncateTitle(latestAssessment.title, 64)} before it closes on ${latestAssessment.endsAt}.`);
    }
    if (completedAssessments[1]) {
        tasks.push(`Revisit ${truncateTitle(completedAssessments[1].title, 64)} to improve consistency across recent assessments.`);
    }
    if (tasks.length === 0) {
        tasks.push(`Open the latest ${scope} assessment and review the missed questions.`);
    }
    const insights = [];
    if (totalEarnable > 0) {
        insights.push(`Across ${completedAssessments.length} assessments, you have ${totalEarned}/${totalEarnable} points overall.`);
    }
    insights.push(`${fullScores} ${fullScores === 1 ? "assessment has" : "assessments have"} a full score in ${scope}.`);
    if (latestAssessment.endsAt) {
        insights.push(`The latest assessment window closes on ${latestAssessment.endsAt}.`);
    }
    return {
        summary,
        tasks: tasks.slice(0, 3),
        insights: insights.slice(0, 3)
    };
}
function buildTodayResponse(snapshot) {
    const assignments = getRelevantAssignments(snapshot);
    const lectures = getRelevantLectures(snapshot);
    const scope = getScopeLabel(snapshot);
    const { todayKey, tomorrowKey, todayLabel, tomorrowLabel } = getTodayContext();
    const todaysAssignments = assignments.filter((assignment)=>isSameDate(assignment.dueTimestamp, todayKey));
    const todaysLectures = lectures.filter((lecture)=>isSameDate(lecture.startTimestamp, todayKey));
    const tomorrowsAssignments = assignments.filter((assignment)=>isSameDate(assignment.dueTimestamp, tomorrowKey));
    const tomorrowsLectures = lectures.filter((lecture)=>isSameDate(lecture.startTimestamp, tomorrowKey));
    const tasks = [];
    const insights = [];
    if (todaysAssignments[0]) {
        tasks.push(`Finish ${truncateTitle(todaysAssignments[0].title, 72)} for ${todaysAssignments[0].subjectName}${todaysAssignments[0].dueAt ? ` by ${todaysAssignments[0].dueAt}` : ""}.`);
        insights.push(`${formatCountLabel(todaysAssignments.length, "assignment is", "assignments are")} due today.`);
    }
    if (todaysLectures[0]) {
        tasks.push(`Prepare for ${todaysLectures[0].subjectName} on ${todaysLectures[0].startsAt}.`);
        insights.push(`${formatCountLabel(todaysLectures.length, "lecture is", "lectures are")} scheduled today.`);
    }
    if (tasks.length === 0 && tomorrowsAssignments[0]) {
        tasks.push(`Start ${truncateTitle(tomorrowsAssignments[0].title, 72)} for ${tomorrowsAssignments[0].subjectName}${tomorrowsAssignments[0].dueAt ? ` before ${tomorrowsAssignments[0].dueAt}` : ""}.`);
        insights.push(`There are no assignment deadlines today, so the nearest deadline is on ${tomorrowLabel}.`);
    }
    if (tasks.length < 2 && tomorrowsLectures[0]) {
        tasks.push(`Prepare for ${tomorrowsLectures[0].subjectName} on ${tomorrowsLectures[0].startsAt}.`);
        insights.push(`Your next lecture is on ${tomorrowLabel}.`);
    }
    if (tasks.length < 3 && assignments[0] && !tasks.some((task)=>task.includes(assignments[0].subjectName))) {
        tasks.push(`Plan ahead for ${truncateTitle(assignments[0].title, 64)}${assignments[0].dueAt ? ` due ${assignments[0].dueAt}` : ""}.`);
    }
    if (!insights.some((insight)=>insight.includes("upcoming"))) {
        insights.push(`${formatCountLabel(lectures.length, "upcoming lecture", "upcoming lectures")} are scheduled in the next 7 days.`);
    }
    const performance = snapshot.overview?.performance;
    if (typeof performance?.lectures_attended === "number" && typeof performance?.total_lectures === "number" && performance.total_lectures > 0) {
        insights.push(`Attendance is ${performance.lectures_attended}/${performance.total_lectures} (${formatPercentage(performance.lectures_attended, performance.total_lectures)}).`);
    }
    if (tasks.length === 0) {
        tasks.push(`Review the next lecture and any newly opened work for ${scope}.`);
    }
    if (insights.length === 0) {
        insights.push(`This response is based on the latest Newton data available for ${scope}.`);
    }
    return {
        summary: tasks.length > 0 && (todaysAssignments.length > 0 || todaysLectures.length > 0) ? `Your priorities for ${todayLabel} in ${scope} are based on today's due work and class schedule.` : `There is no urgent work scheduled for ${todayLabel} in ${scope}, so your best move is to prepare for ${tomorrowLabel}.`,
        tasks: tasks.slice(0, 3),
        insights: insights.slice(0, 3)
    };
}
function buildLocalNewtonResponse(query, snapshot) {
    const intent = detectIntent(query);
    if (intent === "attendance") {
        return buildAttendanceResponse(snapshot);
    }
    if (intent === "assignments") {
        return buildAssignmentsResponse(snapshot);
    }
    if (intent === "score") {
        return buildScoreResponse(snapshot);
    }
    if (intent === "rank") {
        return buildRankResponse(snapshot);
    }
    if (intent === "next_class") {
        return buildNextClassResponse(snapshot);
    }
    if (intent === "schedule") {
        return buildScheduleResponse(snapshot);
    }
    if (intent === "performance") {
        return buildPerformanceResponse(snapshot);
    }
    return buildTodayResponse(snapshot);
}
function buildNewtonPrompt(query, snapshot) {
    return [
        "You are a JSON-only academic assistant.",
        "Use ONLY the Newton School student data provided below.",
        "Do not invent facts that are not present in the Newton data snapshot.",
        "If the data is incomplete, say that briefly in the summary and keep tasks and insights grounded in the available data.",
        "Generate practical next steps and concise observations for the student.",
        "Respond with ONLY valid JSON.",
        "Do not include markdown, code fences, comments, or any explanation outside the JSON object.",
        'Return exactly this shape: {"summary":"","tasks":[],"insights":[]}',
        "The summary must be a concise string.",
        "Tasks must be an array of short, actionable strings.",
        "Insights must be an array of short, factual strings.",
        "",
        "Newton data snapshot:",
        JSON.stringify(snapshot, null, 2),
        "",
        `User query: ${query}`
    ].join("\n");
}
async function getNewtonSnapshot(query) {
    const client = new NewtonMcpClient();
    try {
        await client.initialize();
        const courseData = await client.callTool("list_courses");
        const context = resolveCourseContext(courseData, query);
        const intent = detectIntent(query);
        const leaderboardPeriod = getLeaderboardPeriod(query);
        const toolsUsed = [
            "list_courses"
        ];
        const selectionHash = context.subject?.subject_hash || context.course?.course_hash;
        const courseHash = context.course?.course_hash || courseData?.primary_course_hash || null;
        let overview = null;
        let assignments = null;
        let schedule = null;
        let leaderboard = null;
        let assessments = null;
        if (selectionHash) {
            overview = simplifyOverview(await client.callTool("get_course_overview", {
                course_hash: selectionHash
            }));
            toolsUsed.push("get_course_overview");
        }
        if (courseHash && (intent === "assignments" || intent === "today" || intent === "rank" || intent === "performance" || intent === "schedule")) {
            assignments = simplifyAssignments(await client.callTool("get_assignments", {
                course_hash: courseHash,
                limit: 10,
                ...context.subject ? {
                    subject_hash: context.subject.subject_hash
                } : {}
            }));
            toolsUsed.push("get_assignments");
        }
        if (courseHash && (intent === "attendance" || intent === "today" || intent === "rank" || intent === "next_class" || intent === "performance" || intent === "schedule")) {
            schedule = simplifySchedule(await client.callTool("get_upcoming_schedule", {
                course_hash: courseHash,
                days: 7
            }));
            toolsUsed.push("get_upcoming_schedule");
        }
        if (courseHash && intent === "rank") {
            leaderboard = simplifyLeaderboard(await client.callTool("get_leaderboard", {
                course_hash: courseHash,
                period: leaderboardPeriod,
                limit: 200
            }));
            toolsUsed.push("get_leaderboard");
        }
        if (courseHash && context.subject?.subject_hash && intent === "score") {
            assessments = simplifyAssessments(await client.callTool("get_assessments", {
                course_hash: courseHash,
                subject_hash: context.subject.subject_hash
            }));
            toolsUsed.push("get_assessments");
        }
        return {
            source: "newton-mcp",
            intent,
            query,
            toolsUsed,
            context: {
                matchedBy: context.matchedBy,
                primaryCourseName: courseData?.primary_course_name || null,
                course: simplifyCourse(context.course),
                subject: simplifySubject(context.subject)
            },
            overview,
            assignments,
            schedule,
            leaderboard,
            assessments
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Newton MCP request failed.";
        if (/Authentication required/i.test(message)) {
            throw new Error("Newton MCP authentication is required. Run `npx -y @newtonschool/newton-mcp@latest login` and retry.");
        }
        throw new Error(`Newton data request failed. ${message}`);
    } finally{
        client.close();
    }
}
}),
"[project]/app/api/ask/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$claude$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/claude.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$newton$2d$mcp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/newton-mcp.js [app-route] (ecmascript)");
;
;
const runtime = "nodejs";
function normalizeList(value) {
    if (!Array.isArray(value)) {
        return [];
    }
    return value.map((item)=>{
        if (typeof item === "string") {
            return item.trim();
        }
        return String(item).trim();
    }).filter(Boolean);
}
async function POST(request) {
    let body;
    try {
        body = await request.json();
    } catch  {
        return Response.json({
            error: "Request body must be valid JSON."
        }, {
            status: 400
        });
    }
    try {
        const rawQuery = body?.query;
        if (typeof rawQuery !== "string" || !rawQuery.trim()) {
            return Response.json({
                error: "Request body must include a non-empty string 'query'."
            }, {
                status: 400
            });
        }
        const query = rawQuery.trim();
        const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$newton$2d$mcp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getNewtonSnapshot"])(query);
        const hasClaudeApiKey = Boolean(process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY);
        if (!hasClaudeApiKey) {
            return Response.json({
                ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$newton$2d$mcp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildLocalNewtonResponse"])(query, snapshot),
                source: "newton-local"
            });
        }
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$claude$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["askClaude"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$newton$2d$mcp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildNewtonPrompt"])(query, snapshot));
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(response);
        } catch  {
            throw new Error("Claude returned invalid JSON.");
        }
        if (!parsedResponse || typeof parsedResponse !== "object" || Array.isArray(parsedResponse)) {
            throw new Error("Claude returned an invalid JSON payload.");
        }
        return Response.json({
            summary: typeof parsedResponse.summary === "string" ? parsedResponse.summary : "",
            tasks: normalizeList(parsedResponse.tasks),
            insights: normalizeList(parsedResponse.insights),
            source: "claude-api"
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to process request.";
        return Response.json({
            error: message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0h_-j_y._.js.map