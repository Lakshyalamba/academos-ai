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
"[project]/lib/academic-data.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/app/dashboard/page.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DashboardPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$dashboard$2f$dashboard$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/app/dashboard/dashboard.module.css [app-rsc] (css module)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$academic$2d$data$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/academic-data.js [app-rsc] (ecmascript)");
;
;
;
;
function DashboardPage() {
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
                        lineNumber: 9,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$dashboard$2f$dashboard$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].headerRow,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$dashboard$2f$dashboard$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].title,
                                        children: "Your student dashboard"
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/page.js",
                                        lineNumber: 12,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "page-copy",
                                        children: "A quick view of attendance, assignment progress, and useful insights in one place."
                                    }, void 0, false, {
                                        fileName: "[project]/app/dashboard/page.js",
                                        lineNumber: 13,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/dashboard/page.js",
                                lineNumber: 11,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                href: "/",
                                className: "text-link",
                                children: "Back to home"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/page.js",
                                lineNumber: 19,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/dashboard/page.js",
                        lineNumber: 10,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/dashboard/page.js",
                lineNumber: 8,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$dashboard$2f$dashboard$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].grid,
                "aria-label": "Dashboard sections",
                children: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$academic$2d$data$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dashboardSections"].map((section)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$dashboard$2f$dashboard$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].card,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$dashboard$2f$dashboard$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].cardLabel,
                                children: "Section"
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/page.js",
                                lineNumber: 28,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$dashboard$2f$dashboard$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].cardTitle,
                                children: section.title
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/page.js",
                                lineNumber: 29,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$dashboard$2f$dashboard$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].cardDescription,
                                children: section.description
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/page.js",
                                lineNumber: 30,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$dashboard$2f$dashboard$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].cardList,
                                children: section.items.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        children: item
                                    }, item, false, {
                                        fileName: "[project]/app/dashboard/page.js",
                                        lineNumber: 34,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/dashboard/page.js",
                                lineNumber: 32,
                                columnNumber: 13
                            }, this)
                        ]
                    }, section.title, true, {
                        fileName: "[project]/app/dashboard/page.js",
                        lineNumber: 27,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/app/dashboard/page.js",
                lineNumber: 25,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/dashboard/page.js",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/dashboard/page.js [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/dashboard/page.js [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0muy-~h._.js.map