import Link from "next/link";
import styles from "./dashboard.module.css";
import { getTodayOverview } from "../../lib/dashboard-overview";
import { getRuntimeStatus } from "../../lib/runtime-status";

export const dynamic = "force-dynamic";

function getMetricValue(value, fallback = "Not available") {
  return typeof value === "number" ? String(value) : fallback;
}

function getClassCountLabel(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return "No classes";
  }

  return `${items.length} ${items.length === 1 ? "class" : "classes"}`;
}

export default async function DashboardPage() {
  const runtimeStatus = getRuntimeStatus();
  const { newtonConfigured, llmConfigured, supabaseConfigured } =
    runtimeStatus.config;
  const todayOverview = await getTodayOverview({
    enabled: newtonConfigured,
  });
  const statusPills = [
    {
      label: "Records",
      value: newtonConfigured ? "Ready" : "Missing",
      helper: "Newton-backed academic data",
    },
    {
      label: "Reasoning",
      value: llmConfigured ? "Ready" : "Missing",
      helper: "Gemini response generation",
    },
    {
      label: "Saved snapshots",
      value: supabaseConfigured ? "Enabled" : "Optional",
      helper: "Supabase persistence layer",
    },
  ];
  const statusCards = [
    {
      label: "Readiness",
      title: "Live Answer Readiness",
      description:
        "Academos only answers with verified student data when the live services behind it are ready.",
      items: [
        `Newton MCP connection: ${newtonConfigured ? "Ready" : "Missing"}`,
        `Gemini reasoning: ${llmConfigured ? "Ready" : "Missing"}`,
        `Supabase snapshot storage: ${supabaseConfigured ? "Enabled" : "Optional and off"}`,
      ],
    },
    {
      label: "Trust",
      title: "Trust Safeguards",
      description:
        "This dashboard explains the trust rules behind the demo instead of showing invented student data.",
      items: [
        "Student-facing answers must be grounded in Newton-backed records.",
        "If live academic data is unavailable, the app should say Data not found.",
      ],
    },
    {
      label: "Flow",
      title: "How A Live Answer Is Prepared",
      description:
        "Use the chat experience to fetch fresh records, prepare a structured snapshot, and return a concise answer.",
      items: [
        "Newton fetches the verified academic record before an answer is generated.",
        supabaseConfigured
          ? "Supabase is saving the snapshot before reasoning runs."
          : "Supabase remains available, but the current run uses the in-memory snapshot path.",
        newtonConfigured && llmConfigured
          ? supabaseConfigured
            ? "Setup is complete. The chat flow can fetch, save, and explain a live snapshot."
            : "Setup is complete. The chat flow can explain live data without persistence."
          : runtimeStatus.missing[0] ||
            "Complete the missing configuration before running live academic answers.",
      ],
    },
  ];
  const todayMetrics = [
    {
      label: "Classes today",
      value: getMetricValue(todayOverview.classesTodayCount),
      helper:
        typeof todayOverview.classesTodayCount === "number"
          ? "From your upcoming class schedule"
          : "Today's class schedule is unavailable",
    },
    {
      label: "Pending assignments",
      value: getMetricValue(todayOverview.pendingAssignmentsCount),
      helper:
        typeof todayOverview.pendingAssignmentsCount === "number"
          ? "Open assignment items in the fetched snapshot"
          : "Assignment data is unavailable right now",
    },
    {
      label: "Overdue items",
      value: getMetricValue(todayOverview.overdueItemsCount),
      helper:
        typeof todayOverview.overdueItemsCount === "number"
          ? "Based on assignment due timestamps"
          : "Overdue status is unavailable right now",
    },
  ];

  return (
    <main className="page-shell">
      <section className={styles.header}>
        <p className="eyebrow">Dashboard</p>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>Readiness Dashboard</h1>
            <p className="page-copy">
              Check whether Academos can safely answer with live academic data.
              This page covers readiness and trust, not student record content.
            </p>
          </div>

          <Link href="/" className="text-link">
            Back to home
          </Link>
        </div>
      </section>

      <section className={styles.dashboardLayout} aria-label="Dashboard content">
        <div className={styles.dashboardMain}>
          <section className={styles.todayOverviewCard} aria-label="Today's academic overview">
            <div className={styles.todayOverviewHeader}>
              <div>
                <p className={styles.cardLabel}>Today Overview</p>
                <h2 className={styles.todayOverviewTitle}>Your academic snapshot at a glance</h2>
                <p className={styles.todayOverviewDescription}>{todayOverview.message}</p>
              </div>

              <p className={styles.todayOverviewMeta}>
                {todayOverview.available ? "Live student data" : "Fallback state"}
              </p>
            </div>

            <div className={styles.todayOverviewGrid}>
              {todayMetrics.map((item) => (
                <article key={item.label} className={styles.todayMetric}>
                  <p className={styles.todayMetricLabel}>{item.label}</p>
                  <p className={styles.todayMetricValue}>{item.value}</p>
                  <p className={styles.todayMetricHelper}>{item.helper}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.classesWidget} aria-label="Today and tomorrow classes">
            <div className={styles.classesWidgetHeader}>
              <div>
                <p className={styles.cardLabel}>Classes</p>
                <h2 className={styles.classesWidgetTitle}>Today and tomorrow</h2>
                <p className={styles.classesWidgetDescription}>
                  A quick look at your nearest scheduled classes without opening chat.
                </p>
              </div>
              <p className={styles.todayOverviewMeta}>
                {todayOverview.classesSchedule?.available ? "Live schedule" : "Fallback state"}
              </p>
            </div>

            <div className={styles.classesSectionsGrid}>
              <article className={styles.classesSection}>
                <div className={styles.classesSectionHeader}>
                  <h3 className={styles.classesSectionTitle}>Today</h3>
                  <span className={styles.classesSectionMeta}>
                    {getClassCountLabel(todayOverview.classesSchedule?.today)}
                  </span>
                </div>

                {todayOverview.classesSchedule?.today?.length ? (
                  <ul className={styles.classesList}>
                    {todayOverview.classesSchedule.today.map((entry) => (
                      <li
                        key={`${entry.subjectName}-${entry.time}-${entry.type}`}
                        className={styles.classRow}
                      >
                        <div>
                          <p className={styles.className}>{entry.subjectName}</p>
                        </div>
                        <div className={styles.classMeta}>
                          <span className={styles.classBadge}>{entry.time}</span>
                          <span className={styles.classBadgeMuted}>{entry.type || "Class"}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.classesEmptyState}>
                    {todayOverview.classesSchedule?.todayEmptyMessage ||
                      "No classes scheduled today."}
                  </p>
                )}
              </article>

              <article className={styles.classesSection}>
                <div className={styles.classesSectionHeader}>
                  <h3 className={styles.classesSectionTitle}>Tomorrow</h3>
                  <span className={styles.classesSectionMeta}>
                    {getClassCountLabel(todayOverview.classesSchedule?.tomorrow)}
                  </span>
                </div>

                {todayOverview.classesSchedule?.tomorrow?.length ? (
                  <ul className={styles.classesList}>
                    {todayOverview.classesSchedule.tomorrow.map((entry) => (
                      <li
                        key={`${entry.subjectName}-${entry.time}-${entry.type}`}
                        className={styles.classRow}
                      >
                        <div>
                          <p className={styles.className}>{entry.subjectName}</p>
                        </div>
                        <div className={styles.classMeta}>
                          <span className={styles.classBadge}>{entry.time}</span>
                          <span className={styles.classBadgeMuted}>{entry.type || "Class"}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.classesEmptyState}>
                    {todayOverview.classesSchedule?.tomorrowEmptyMessage ||
                      "No classes scheduled tomorrow."}
                  </p>
                )}
              </article>
            </div>
          </section>

          <section className={styles.statusStrip} aria-label="Readiness summary">
            {statusPills.map((item) => (
              <article key={item.label} className={styles.statusPill}>
                <p className={styles.statusLabel}>{item.label}</p>
                <p className={styles.statusValue}>{item.value}</p>
                <p className={styles.statusHelper}>{item.helper}</p>
              </article>
            ))}
          </section>

          <section className={styles.grid} aria-label="Dashboard sections">
            {statusCards.map((section) => (
              <article key={section.title} className={styles.card}>
                <p className={styles.cardLabel}>{section.label}</p>
                <h2 className={styles.cardTitle}>{section.title}</h2>
                <p className={styles.cardDescription}>{section.description}</p>

                <ul className={styles.cardList}>
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </section>

          <details className={styles.detailsCard}>
            <summary className={styles.detailsSummary}>Technical details</summary>
            <div className={styles.detailsBody}>
              <p className={styles.detailsText}>
                Runtime configuration stays available for demos, but it is kept out
                of the main student-facing content by default.
              </p>
              <ul className={styles.detailsList}>
                <li>Newton MCP: {newtonConfigured ? "Ready" : "Missing"}</li>
                <li>Gemini: {llmConfigured ? "Ready" : "Missing"}</li>
                <li>
                  Supabase: {supabaseConfigured ? "Enabled for snapshot storage" : "Optional and currently off"}
                </li>
                {runtimeStatus.commands.restartDevServer ? (
                  <li>
                    Dev server command: <code>{runtimeStatus.commands.restartDevServer}</code>
                  </li>
                ) : null}
              </ul>
            </div>
          </details>
        </div>

        <aside className={styles.dashboardSidebar}>
          <section className={styles.assignmentsPanel} aria-label="Pending assignments">
            <div className={styles.assignmentsPanelHeader}>
              <div>
                <p className={styles.cardLabel}>Pending Assignments</p>
                <h2 className={styles.assignmentsPanelTitle}>Academic work to watch</h2>
              </div>
              <p className={styles.assignmentsPanelMeta}>
                {todayOverview.pendingAssignments?.available ? "Live items" : "Fallback state"}
              </p>
            </div>

            {todayOverview.pendingAssignments?.items?.length ? (
              <ul className={styles.assignmentList}>
                {todayOverview.pendingAssignments.items.map((item) => (
                  <li
                    key={`${item.title}-${item.subjectName}-${item.dueTimestamp || item.dueAt || "no-date"}`}
                    className={styles.assignmentItem}
                  >
                    <div className={styles.assignmentItemHeader}>
                      <h3 className={styles.assignmentTitle}>{item.title}</h3>
                      {item.overdue ? (
                        <span className={styles.overdueBadge}>Overdue</span>
                      ) : null}
                    </div>
                    <p className={styles.assignmentSubject}>{item.subjectName}</p>
                    <p className={styles.assignmentDue}>
                      {item.dueAt ? `Due ${item.dueAt}` : "Due date not available"}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.assignmentsEmptyState}>
                {todayOverview.pendingAssignments?.emptyMessage ||
                  "No pending assignments found in the current live snapshot."}
              </p>
            )}
          </section>
        </aside>
      </section>
    </main>
  );
}
