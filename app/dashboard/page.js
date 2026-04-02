import Link from "next/link";
import styles from "./dashboard.module.css";
import TodoListCard from "./TodoListCard";
import { getAttendanceAlert } from "../../lib/attendance-alert";
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

function getAttendanceStateLabel(state) {
  switch (state) {
    case "healthy":
      return "Healthy";
    case "watch":
      return "Watch";
    case "risk":
      return "Risk";
    default:
      return "Unavailable";
  }
}

export default async function DashboardPage() {
  const { newtonConfigured } = getRuntimeStatus().config;
  const [todayOverview, attendanceAlert] = await Promise.all([
    getTodayOverview({
      enabled: newtonConfigured,
    }),
    getAttendanceAlert({
      enabled: newtonConfigured,
    }),
  ]);
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
            <h1 className={styles.title}>Academic Dashboard</h1>
            <p className="page-copy">
              See today's classes, attendance, and academic work in one
              student-friendly view.
            </p>
          </div>

          <Link href="/" className="text-link">
            Back to home
          </Link>
        </div>
      </section>

      <TodoListCard />

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
        </div>

        <aside className={styles.dashboardSidebar}>
          <section className={styles.attendancePanel} aria-label="Attendance alert">
            <div className={styles.attendancePanelHeader}>
              <div>
                <p className={styles.cardLabel}>Attendance Alert</p>
                <h2 className={styles.attendancePanelTitle}>Combined subject attendance</h2>
                <p className={styles.attendancePanelDescription}>
                  Class and lab attendance are combined before each subject is averaged.
                </p>
              </div>
              <span
                className={`${styles.attendanceStateBadge} ${
                  attendanceAlert.state === "healthy"
                    ? styles.attendanceStateHealthy
                    : attendanceAlert.state === "watch"
                      ? styles.attendanceStateWatch
                      : attendanceAlert.state === "risk"
                        ? styles.attendanceStateRisk
                        : styles.attendanceStateUnavailable
                }`}
              >
                {getAttendanceStateLabel(attendanceAlert.state)}
              </span>
            </div>

            {attendanceAlert.available ? (
              <>
                <div className={styles.attendanceAverageCard}>
                  <p className={styles.attendanceAverageLabel}>
                    Average across {attendanceAlert.subjectCount}{" "}
                    {attendanceAlert.subjectCount === 1 ? "subject" : "subjects"}
                  </p>
                  <p className={styles.attendanceAverageValue}>
                    {attendanceAlert.averageLabel || "Not available"}
                  </p>
                  <p className={styles.attendanceAverageHelper}>
                    {attendanceAlert.explanation}
                  </p>
                </div>

                <ul className={styles.attendanceSubjectList}>
                  {attendanceAlert.subjects.map((subject) => (
                    <li key={subject.name} className={styles.attendanceSubjectRow}>
                      <div>
                        <h3 className={styles.attendanceSubjectName}>{subject.name}</h3>
                        <p className={styles.attendanceSubjectMeta}>
                          {subject.attendedLectures}/{subject.totalLectures} combined classes
                        </p>
                      </div>
                      <span className={styles.attendanceSubjectValue}>
                        {subject.percentageLabel}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className={styles.assignmentsEmptyState}>
                {attendanceAlert.explanation}
              </p>
            )}
          </section>

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
