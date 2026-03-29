module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/app/icon.svg (static in ecmascript, tag client)", ((__turbopack_context__) => {

__turbopack_context__.v("/_next/static/media/icon.10-~atwtwkq~i.svg" + (globalThis["NEXT_CLIENT_ASSET_SUFFIX"] || ''));}),
"[project]/app/icon.svg.mjs { IMAGE => \"[project]/app/icon.svg (static in ecmascript, tag client)\" } [app-rsc] (structured image object, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$icon$2e$svg__$28$static__in__ecmascript$2c$__tag__client$29$__ = __turbopack_context__.i("[project]/app/icon.svg (static in ecmascript, tag client)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$icon$2e$svg__$28$static__in__ecmascript$2c$__tag__client$29$__["default"],
    width: 64,
    height: 64
};
}),
"[project]/app/dashboard/dashboard.module.css [app-rsc] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "card": "dashboard-module__Gx_nyq__card",
  "cardDescription": "dashboard-module__Gx_nyq__cardDescription",
  "cardLabel": "dashboard-module__Gx_nyq__cardLabel",
  "cardList": "dashboard-module__Gx_nyq__cardList",
  "cardTitle": "dashboard-module__Gx_nyq__cardTitle",
  "grid": "dashboard-module__Gx_nyq__grid",
  "header": "dashboard-module__Gx_nyq__header",
  "headerRow": "dashboard-module__Gx_nyq__headerRow",
  "title": "dashboard-module__Gx_nyq__title",
});
}),
"[project]/lib/claude.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "askClaude",
    ()=>askClaude,
    "getConfiguredClaudeModel",
    ()=>getConfiguredClaudeModel,
    "isClaudeConfigured",
    ()=>isClaudeConfigured
]);
;
const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_CLAUDE_MODEL = "claude-sonnet-4-6";
function getClaudeApiKey() {
    return process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
}
function getConfiguredClaudeModel() {
    return process.env.ANTHROPIC_MODEL || process.env.CLAUDE_MODEL || DEFAULT_CLAUDE_MODEL;
}
function isClaudeConfigured() {
    return Boolean(getClaudeApiKey());
}
async function askClaude(query) {
    const apiKey = getClaudeApiKey();
    const model = getConfiguredClaudeModel();
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
"[project]/lib/supabase.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getAcademicSnapshotById",
    ()=>getAcademicSnapshotById,
    "insertAcademicSnapshot",
    ()=>insertAcademicSnapshot,
    "isSupabaseConfigured",
    ()=>isSupabaseConfigured,
    "updateAcademicSnapshotReasoning",
    ()=>updateAcademicSnapshotReasoning
]);
;
const DEFAULT_SNAPSHOTS_TABLE = "academic_snapshots";
function getSupabaseConfig() {
    const url = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const table = process.env.SUPABASE_ACADEMIC_SNAPSHOTS_TABLE || DEFAULT_SNAPSHOTS_TABLE;
    if (!url || !serviceRoleKey) {
        throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable.");
    }
    return {
        url: url.replace(/\/+$/, ""),
        serviceRoleKey,
        table
    };
}
async function parseSupabaseResponse(response) {
    const text = await response.text();
    if (!text) {
        return null;
    }
    try {
        return JSON.parse(text);
    } catch  {
        return text;
    }
}
async function supabaseRequest(path, { method = "GET", body, headers } = {}) {
    const { url, serviceRoleKey } = getSupabaseConfig();
    const response = await fetch(`${url}/rest/v1/${path}`, {
        method,
        cache: "no-store",
        headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            "Content-Type": "application/json",
            ...headers
        },
        ...typeof body === "undefined" ? {} : {
            body: JSON.stringify(body)
        }
    });
    const data = await parseSupabaseResponse(response);
    if (!response.ok) {
        let message = data?.message || data?.error_description || data?.details || (typeof data === "string" ? data : "Supabase request failed.");
        if (/academic_snapshots/i.test(message) && /does not exist|relation/i.test(message)) {
            message = "Supabase table setup is missing. Apply supabase/schema.sql before using this flow.";
        }
        throw new Error(message);
    }
    return data;
}
function isSupabaseConfigured() {
    return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
async function insertAcademicSnapshot({ query, intent, source, toolsUsed, snapshot }) {
    const { table } = getSupabaseConfig();
    const rows = await supabaseRequest(`${table}?select=*`, {
        method: "POST",
        headers: {
            Prefer: "return=representation"
        },
        body: {
            query,
            intent,
            source,
            tools_used: toolsUsed,
            snapshot
        }
    });
    if (!Array.isArray(rows) || !rows[0]) {
        throw new Error("Supabase did not return the inserted academic snapshot.");
    }
    return rows[0];
}
async function getAcademicSnapshotById(id) {
    const { table } = getSupabaseConfig();
    const rows = await supabaseRequest(`${table}?id=eq.${encodeURIComponent(id)}&select=*`);
    if (!Array.isArray(rows) || !rows[0]) {
        throw new Error("Stored academic snapshot was not found in Supabase.");
    }
    return rows[0];
}
async function updateAcademicSnapshotReasoning(id, { reasoningResponse, reasoningModel }) {
    const { table } = getSupabaseConfig();
    const rows = await supabaseRequest(`${table}?id=eq.${encodeURIComponent(id)}&select=*`, {
        method: "PATCH",
        headers: {
            Prefer: "return=representation"
        },
        body: {
            reasoning_response: reasoningResponse,
            reasoning_model: reasoningModel
        }
    });
    if (!Array.isArray(rows) || !rows[0]) {
        throw new Error("Supabase did not return the updated academic snapshot.");
    }
    return rows[0];
}
}),
"[project]/app/dashboard/page.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DashboardPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$dashboard$2f$dashboard$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/app/dashboard/dashboard.module.css [app-rsc] (css module)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$claude$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/claude.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.js [app-rsc] (ecmascript)");
;
;
;
;
;
function DashboardPage() {
    const claudeConfigured = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$claude$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isClaudeConfigured"])();
    const supabaseConfigured = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])();
    const statusCards = [
        {
            title: "Backend Readiness",
            description: "The live academic flow requires both Supabase storage and Claude reasoning before any student data can be surfaced safely.",
            items: [
                `Supabase configured: ${supabaseConfigured ? "Yes" : "No"}`,
                `Claude configured: ${claudeConfigured ? "Yes" : "No"}`
            ]
        },
        {
            title: "Data Integrity",
            description: "This dashboard no longer renders invented attendance, assignments, or performance data.",
            items: [
                "Academic answers must come from Newton MCP data only.",
                "If live data is unavailable, the app should say Data not found."
            ]
        },
        {
            title: "Next Step",
            description: "Use the chat flow to sync Newton MCP data into Supabase, then reason over the stored record.",
            items: [
                "Flow: MCP -> Backend -> Supabase -> Claude -> UI",
                claudeConfigured && supabaseConfigured ? "Configuration is present. You can use the chat route to create a live snapshot." : "Complete the missing configuration before running academic reasoning."
            ]
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "page-shell",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$dashboard$2f$dashboard$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].header,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "eyebrow",
                        children: "Dashboard"
                    }, void 0, false, {
                        fileName: "[project]/app/dashboard/page.js",
                        lineNumber: 44,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$dashboard$2f$dashboard$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].headerRow,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$dashboard$2f$dashboard$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].title,
                                        children: "System Dashboard"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/page.js",
                                        lineNumber: 47,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "page-copy",
                                        children: "This page shows whether the live academic pipeline is ready. It does not display fabricated student data."
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/page.js",
                                        lineNumber: 48,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/page.js",
                                lineNumber: 46,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                href: "/",
                                className: "text-link",
                                children: "Back to home"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/page.js",
                                lineNumber: 54,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/page.js",
                        lineNumber: 45,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/dashboard/page.js",
                lineNumber: 43,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$dashboard$2f$dashboard$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].grid,
                "aria-label": "Dashboard sections",
                children: statusCards.map((section)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$dashboard$2f$dashboard$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].card,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$dashboard$2f$dashboard$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].cardLabel,
                                children: "Section"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/page.js",
                                lineNumber: 63,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$dashboard$2f$dashboard$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].cardTitle,
                                children: section.title
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/page.js",
                                lineNumber: 64,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$dashboard$2f$dashboard$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].cardDescription,
                                children: section.description
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/page.js",
                                lineNumber: 65,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$dashboard$2f$dashboard$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].cardList,
                                children: section.items.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        children: item
                                    }, item, false, {
                                        fileName: "[project]/app/dashboard/page.js",
                                        lineNumber: 69,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/page.js",
                                lineNumber: 67,
                                columnNumber: 13
                            }, this)
                        ]
                    }, section.title, true, {
                        fileName: "[project]/app/dashboard/page.js",
                        lineNumber: 62,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/app/dashboard/page.js",
                lineNumber: 60,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/dashboard/page.js",
        lineNumber: 42,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/dashboard/page.js [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/dashboard/page.js [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0xb7.tt._.js.map