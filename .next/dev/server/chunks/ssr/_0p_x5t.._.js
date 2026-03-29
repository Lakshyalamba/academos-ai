module.exports = [
"[project]/app/chat/chat.module.css [app-ssr] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "actions": "chat-module__-9LyAa__actions",
  "button": "chat-module__-9LyAa__button",
  "cardLabel": "chat-module__-9LyAa__cardLabel",
  "emptyState": "chat-module__-9LyAa__emptyState",
  "emptyText": "chat-module__-9LyAa__emptyText",
  "errorMessage": "chat-module__-9LyAa__errorMessage",
  "formCard": "chat-module__-9LyAa__formCard",
  "header": "chat-module__-9LyAa__header",
  "headerRow": "chat-module__-9LyAa__headerRow",
  "input": "chat-module__-9LyAa__input",
  "label": "chat-module__-9LyAa__label",
  "layout": "chat-module__-9LyAa__layout",
  "list": "chat-module__-9LyAa__list",
  "responseBox": "chat-module__-9LyAa__responseBox",
  "responseContent": "chat-module__-9LyAa__responseContent",
  "responseSection": "chat-module__-9LyAa__responseSection",
  "resultCard": "chat-module__-9LyAa__resultCard",
  "resultsColumn": "chat-module__-9LyAa__resultsColumn",
  "sectionTitle": "chat-module__-9LyAa__sectionTitle",
  "sourceBadge": "chat-module__-9LyAa__sourceBadge",
  "statusMessage": "chat-module__-9LyAa__statusMessage",
  "summaryText": "chat-module__-9LyAa__summaryText",
  "title": "chat-module__-9LyAa__title",
});
}),
"[project]/app/chat/ChatClient.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ChatClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$chat$2f$chat$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/app/chat/chat.module.css [app-ssr] (css module)");
"use client";
;
;
;
const initialResponse = {
    summary: "",
    tasks: [],
    insights: [],
    source: "",
    snapshotId: ""
};
const initialSetupStatus = {
    checked: false,
    claudeConfigured: true,
    supabaseConfigured: true
};
function ChatClient() {
    const [query, setQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [responseData, setResponseData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialResponse);
    const [errorMessage, setErrorMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [setupStatus, setSetupStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialSetupStatus);
    const hasResponse = Boolean(responseData.summary) || responseData.tasks.length > 0 || responseData.insights.length > 0;
    const isConfigured = setupStatus.claudeConfigured && setupStatus.supabaseConfigured;
    const setupIssues = [
        !setupStatus.supabaseConfigured ? "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY" : null,
        !setupStatus.claudeConfigured ? "ANTHROPIC_API_KEY / CLAUDE_API_KEY" : null
    ].filter(Boolean);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let isActive = true;
        async function loadSetupStatus() {
            try {
                const response = await fetch("/api", {
                    cache: "no-store"
                });
                const data = await response.json();
                if (!isActive) {
                    return;
                }
                setSetupStatus({
                    checked: true,
                    claudeConfigured: Boolean(data?.config?.claudeConfigured),
                    supabaseConfigured: Boolean(data?.config?.supabaseConfigured)
                });
            } catch  {
                if (!isActive) {
                    return;
                }
                setSetupStatus({
                    checked: true,
                    claudeConfigured: false,
                    supabaseConfigured: false
                });
            }
        }
        loadSetupStatus();
        return ()=>{
            isActive = false;
        };
    }, []);
    async function handleSubmit(event) {
        event.preventDefault();
        if (!isConfigured) {
            setErrorMessage(`Setup required before reasoning can run: ${setupIssues.join(", ")}.`);
            setResponseData(initialResponse);
            return;
        }
        if (!query.trim()) {
            setErrorMessage("Please enter a question before sending the request.");
            setResponseData(initialResponse);
            return;
        }
        setIsLoading(true);
        setErrorMessage("");
        setResponseData(initialResponse);
        try {
            const request = await fetch("/api/ask", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    query
                })
            });
            const data = await request.json();
            if (!request.ok) {
                setErrorMessage(data.error || "Request failed.");
                setResponseData(initialResponse);
                return;
            }
            setResponseData({
                summary: typeof data.summary === "string" ? data.summary : "",
                tasks: Array.isArray(data.tasks) ? data.tasks : [],
                insights: Array.isArray(data.insights) ? data.insights : [],
                source: typeof data.source === "string" ? data.source : "",
                snapshotId: typeof data.snapshotId === "string" ? data.snapshotId : ""
            });
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Unable to reach the API route.");
            setResponseData(initialResponse);
        } finally{
            setIsLoading(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$chat$2f$chat$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].layout,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$chat$2f$chat$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].formCard,
                onSubmit: handleSubmit,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        htmlFor: "chat-query",
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$chat$2f$chat$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].label,
                        children: "Ask a question"
                    }, void 0, false, {
                        fileName: "[project]/app/chat/ChatClient.js",
                        lineNumber: 135,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        id: "chat-query",
                        name: "query",
                        type: "text",
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$chat$2f$chat$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].input,
                        value: query,
                        onChange: (event)=>setQuery(event.target.value),
                        placeholder: "What should I do today?",
                        autoComplete: "off",
                        disabled: isLoading
                    }, void 0, false, {
                        fileName: "[project]/app/chat/ChatClient.js",
                        lineNumber: 138,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$chat$2f$chat$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].actions,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "submit",
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$chat$2f$chat$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].button,
                            disabled: isLoading || !isConfigured,
                            children: isLoading ? "Syncing..." : !isConfigured ? "Setup Required" : "Run Academic Reasoning"
                        }, void 0, false, {
                            fileName: "[project]/app/chat/ChatClient.js",
                            lineNumber: 151,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/chat/ChatClient.js",
                        lineNumber: 150,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/chat/ChatClient.js",
                lineNumber: 134,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$chat$2f$chat$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].resultsColumn,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$chat$2f$chat$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].resultCard,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$chat$2f$chat$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].cardLabel,
                            children: "Response"
                        }, void 0, false, {
                            fileName: "[project]/app/chat/ChatClient.js",
                            lineNumber: 167,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$chat$2f$chat$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].responseBox,
                            "aria-live": "polite",
                            children: isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$chat$2f$chat$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].statusMessage,
                                children: "Backend is syncing Newton MCP data to Supabase and sending the stored record to Claude..."
                            }, void 0, false, {
                                fileName: "[project]/app/chat/ChatClient.js",
                                lineNumber: 170,
                                columnNumber: 15
                            }, this) : setupStatus.checked && !isConfigured ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$chat$2f$chat$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].errorMessage,
                                children: [
                                    "Setup required before academic reasoning can run: ",
                                    setupIssues.join(", "),
                                    "."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/chat/ChatClient.js",
                                lineNumber: 174,
                                columnNumber: 15
                            }, this) : errorMessage ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$chat$2f$chat$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].errorMessage,
                                children: errorMessage
                            }, void 0, false, {
                                fileName: "[project]/app/chat/ChatClient.js",
                                lineNumber: 178,
                                columnNumber: 15
                            }, this) : hasResponse ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$chat$2f$chat$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].responseContent,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$chat$2f$chat$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].sourceBadge,
                                        children: responseData.source === "supabase-claude" ? "MCP -> Backend -> Supabase -> Claude" : "Response ready"
                                    }, void 0, false, {
                                        fileName: "[project]/app/chat/ChatClient.js",
                                        lineNumber: 181,
                                        columnNumber: 17
                                    }, this),
                                    responseData.snapshotId ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$chat$2f$chat$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].emptyText,
                                        children: [
                                            "Snapshot ID: ",
                                            responseData.snapshotId
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/chat/ChatClient.js",
                                        lineNumber: 187,
                                        columnNumber: 19
                                    }, this) : null,
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$chat$2f$chat$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].responseSection,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$chat$2f$chat$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].sectionTitle,
                                                children: "Summary"
                                            }, void 0, false, {
                                                fileName: "[project]/app/chat/ChatClient.js",
                                                lineNumber: 193,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$chat$2f$chat$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].summaryText,
                                                children: responseData.summary
                                            }, void 0, false, {
                                                fileName: "[project]/app/chat/ChatClient.js",
                                                lineNumber: 194,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/chat/ChatClient.js",
                                        lineNumber: 192,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$chat$2f$chat$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].responseSection,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$chat$2f$chat$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].sectionTitle,
                                                children: "Tasks"
                                            }, void 0, false, {
                                                fileName: "[project]/app/chat/ChatClient.js",
                                                lineNumber: 198,
                                                columnNumber: 19
                                            }, this),
                                            responseData.tasks.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$chat$2f$chat$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].list,
                                                children: responseData.tasks.map((task, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                        children: task
                                                    }, `${task}-${index}`, false, {
                                                        fileName: "[project]/app/chat/ChatClient.js",
                                                        lineNumber: 202,
                                                        columnNumber: 25
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/app/chat/ChatClient.js",
                                                lineNumber: 200,
                                                columnNumber: 21
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$chat$2f$chat$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].emptyText,
                                                children: "No tasks returned."
                                            }, void 0, false, {
                                                fileName: "[project]/app/chat/ChatClient.js",
                                                lineNumber: 206,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/chat/ChatClient.js",
                                        lineNumber: 197,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$chat$2f$chat$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].responseSection,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$chat$2f$chat$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].sectionTitle,
                                                children: "Insights"
                                            }, void 0, false, {
                                                fileName: "[project]/app/chat/ChatClient.js",
                                                lineNumber: 211,
                                                columnNumber: 19
                                            }, this),
                                            responseData.insights.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$chat$2f$chat$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].list,
                                                children: responseData.insights.map((insight, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                        children: insight
                                                    }, `${insight}-${index}`, false, {
                                                        fileName: "[project]/app/chat/ChatClient.js",
                                                        lineNumber: 215,
                                                        columnNumber: 25
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/app/chat/ChatClient.js",
                                                lineNumber: 213,
                                                columnNumber: 21
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$chat$2f$chat$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].emptyText,
                                                children: "No insights returned."
                                            }, void 0, false, {
                                                fileName: "[project]/app/chat/ChatClient.js",
                                                lineNumber: 219,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/chat/ChatClient.js",
                                        lineNumber: 210,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/chat/ChatClient.js",
                                lineNumber: 180,
                                columnNumber: 15
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$chat$2f$chat$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].emptyState,
                                children: "Ask about attendance, quizzes, contests, calendar, arena, or subject performance."
                            }, void 0, false, {
                                fileName: "[project]/app/chat/ChatClient.js",
                                lineNumber: 224,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/chat/ChatClient.js",
                            lineNumber: 168,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/chat/ChatClient.js",
                    lineNumber: 166,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/chat/ChatClient.js",
                lineNumber: 165,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/chat/ChatClient.js",
        lineNumber: 133,
        columnNumber: 5
    }, this);
}
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime;
}),
];

//# sourceMappingURL=_0p_x5t.._.js.map