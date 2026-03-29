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
"[project]/lib/supabase.js [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/app/api/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$claude$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/claude.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.js [app-route] (ecmascript)");
;
;
async function GET() {
    const claudeConfigured = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$claude$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isClaudeConfigured"])();
    const supabaseConfigured = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])();
    return Response.json({
        status: claudeConfigured && supabaseConfigured ? "ok" : "setup-required",
        message: claudeConfigured && supabaseConfigured ? "Academos API route is ready." : "Academos requires Supabase and Claude configuration before academic reasoning can run.",
        config: {
            claudeConfigured,
            supabaseConfigured
        },
        links: [
            "/dashboard",
            "/chat"
        ]
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0giwzlo._.js.map