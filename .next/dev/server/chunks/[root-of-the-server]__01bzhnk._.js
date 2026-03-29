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
const CLAUDE_MODEL = "claude-sonnet-4-6";
async function askClaude(query) {
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
        throw new Error("Missing CLAUDE_API_KEY environment variable.");
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
            model: CLAUDE_MODEL,
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
"[project]/lib/academic-data.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "academicData",
    ()=>academicData,
    "buildLocalAcademicResponse",
    ()=>buildLocalAcademicResponse,
    "dashboardSections",
    ()=>dashboardSections
]);
const academicData = {
    attendance: {
        weeklyRate: "92%",
        missedClassesThisMonth: 1,
        status: "healthy"
    },
    assignments: [
        {
            title: "Linear Algebra problem set",
            due: "tomorrow",
            status: "pending",
            priority: "high"
        },
        {
            title: "History reflection",
            due: "Friday",
            status: "pending",
            priority: "medium"
        }
    ],
    schedule: [
        {
            course: "Physics lab",
            day: "Monday",
            time: "9:00 AM"
        },
        {
            course: "Calculus tutorial",
            day: "Monday",
            time: "1:00 PM"
        }
    ],
    performance: {
        lastSubmissionGrade: "A-",
        mostActiveStudyDay: "Wednesday",
        momentum: "strong"
    }
};
const dashboardSections = [
    {
        title: "Attendance",
        description: "Track class presence and stay ahead of low-attendance risks.",
        items: [
            `Weekly attendance: ${academicData.attendance.weeklyRate}`,
            `Classes missed: ${academicData.attendance.missedClassesThisMonth} this month`
        ]
    },
    {
        title: "Assignments",
        description: "Review upcoming submissions and recently completed work.",
        items: [
            `${academicData.assignments.length} assignments due this week`,
            `Last submission graded: ${academicData.performance.lastSubmissionGrade}`
        ]
    },
    {
        title: "Insights",
        description: "See patterns in your performance and study consistency.",
        items: [
            `Most active study day: ${academicData.performance.mostActiveStudyDay}`,
            `Current momentum: ${academicData.performance.momentum}`
        ]
    }
];
function buildLocalAcademicResponse(query) {
    const normalizedQuery = query.toLowerCase();
    if (normalizedQuery.includes("attendance")) {
        return {
            summary: "Your attendance is in good shape at 92%, with only one missed class this month.",
            tasks: [
                "Attend your next Physics lab and Calculus tutorial to keep attendance above 90%.",
                "Review any notes from the class you missed so your attendance gap does not become a learning gap."
            ],
            insights: [
                "Your attendance status is healthy and does not show an immediate risk.",
                "One missed class this month is manageable if you stay consistent over the next week."
            ]
        };
    }
    if (normalizedQuery.includes("assignment") || normalizedQuery.includes("pending")) {
        return {
            summary: "You have two pending assignments this week, with the Linear Algebra problem set due first.",
            tasks: [
                "Finish the Linear Algebra problem set due tomorrow.",
                "Draft the History reflection due Friday before midweek."
            ],
            insights: [
                "Your nearest deadline is the Linear Algebra problem set, so it should stay first in your queue.",
                "Your recent A- suggests you are in a strong position if you keep submissions on schedule."
            ]
        };
    }
    return {
        summary: "Today should focus on clearing your nearest assignment deadline and preparing for Monday's classes.",
        tasks: [
            "Complete the Linear Algebra problem set due tomorrow.",
            "Outline the History reflection due Friday.",
            "Prepare for Monday's Physics lab at 9:00 AM and Calculus tutorial at 1:00 PM."
        ],
        insights: [
            "You have two pending assignments this week, so finishing one today will reduce pressure quickly.",
            "Attendance is healthy at 92%, which gives you room to focus on coursework without an attendance risk.",
            "Your last graded submission was an A-, and your study momentum is currently strong."
        ]
    };
}
}),
"[project]/app/api/ask/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$claude$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/claude.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$academic$2d$data$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/academic-data.js [app-route] (ecmascript)");
;
;
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
        const prompt = [
            "You are a JSON-only academic assistant.",
            "Assume you have access to the student's academic data through MCP tools and academic context.",
            "Use that academic data to answer the user's question.",
            "Typical queries include:",
            '- "What should I do today?"',
            '- "What assignments are pending?"',
            '- "How is my attendance?"',
            "Generate actionable next steps and useful insights grounded in the student's academic data.",
            "Prioritize deadlines, pending assignments, attendance risk, upcoming classes, and urgent academic actions when relevant.",
            "If the academic data is incomplete, state that briefly in the summary and give the best possible tasks and insights from the available data.",
            "Respond with ONLY valid JSON.",
            "Do not include markdown, code fences, comments, or any explanation outside the JSON object.",
            'Return exactly this shape: {"summary":"","tasks":[],"insights":[]}',
            "The summary must be a concise string for the student.",
            "Tasks must be an array of short, actionable strings.",
            "Insights must be an array of short, useful observations based on academic data.",
            "Academic data snapshot:",
            JSON.stringify(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$academic$2d$data$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["academicData"], null, 2),
            "",
            `User query: ${query}`
        ].join("\n");
        if (!process.env.CLAUDE_API_KEY) {
            return Response.json((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$academic$2d$data$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildLocalAcademicResponse"])(query));
        }
        const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$claude$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["askClaude"])(prompt);
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
            insights: normalizeList(parsedResponse.insights)
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

//# sourceMappingURL=%5Broot-of-the-server%5D__01bzhnk._.js.map