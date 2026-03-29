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
"[project]/app/api/ask/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$claude$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/claude.js [app-route] (ecmascript)");
;
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
            "",
            `User query: ${query}`
        ].join("\n");
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
            tasks: Array.isArray(parsedResponse.tasks) ? parsedResponse.tasks : [],
            insights: Array.isArray(parsedResponse.insights) ? parsedResponse.insights : []
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

//# sourceMappingURL=%5Broot-of-the-server%5D__0hjnq.6._.js.map