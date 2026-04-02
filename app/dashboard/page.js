import Link from "next/link";
import styles from "./dashboard.module.css";
import TodoListCard from "./TodoListCard";
import { getAttendanceAlert } from "../../lib/attendance-alert";
import { getCatchUp } from "../../lib/catch-up";
import { getTodayOverview } from "../../lib/dashboard-overview";

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

function getSectionMeta(available, readyLabel) {
  return available ? readyLabel : "Unavailable";
}

export default async function DashboardPage() {
  const todayOverview = await getTodayOverview();
  const attendanceAlert = await getAttendanceAlert();
  const catchUp = await getCatchUp();
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
              Everything you need for the day, from classes and pending work to
              attendance and catch-up.
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
                <h2 className={styles.todayOverviewTitle}>Today at a glance</h2>
                <p className={styles.todayOverviewDescription}>{todayOverview.message}</p>
              </div>

              <p className={styles.todayOverviewMeta}>
                {getSectionMeta(todayOverview.available, "Live view")}
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

          <div className={styles.dashboardSecondaryGrid}>
            <section className={styles.classesWidget} aria-label="Today and tomorrow classes">
              <div className={styles.classesWidgetHeader}>
                <div>
                  <p className={styles.cardLabel}>Classes</p>
                  <h2 className={styles.classesWidgetTitle}>Today and tomorrow</h2>
                  <p className={styles.classesWidgetDescription}>
                    Your nearest schedule without opening chat.
                  </p>
                </div>
                <p className={styles.todayOverviewMeta}>
                  {getSectionMeta(todayOverview.classesSchedule?.available, "Live schedule")}
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

            <section className={styles.catchUpPanel} aria-label="Recent missed lectures">
              <div className={styles.catchUpPanelHeader}>
                <div>
                  <p className={styles.cardLabel}>Catch Up</p>
                  <h2 className={styles.catchUpPanelTitle}>Recent missed lectures</h2>
                  <p className={styles.catchUpPanelDescription}>
                    Missed lectures worth reviewing next.
                  </p>
                </div>
                <p className={styles.catchUpPanelMeta}>
                  {getSectionMeta(catchUp.available, "Live activity")}
                </p>
              </div>

              {catchUp.items?.length ? (
                <ul className={styles.catchUpList}>
                  {catchUp.items.map((item) => (
                    <li key={item.id} className={styles.catchUpItem}>
                      <div className={styles.catchUpItemHeader}>
                        <div>
                          <h3 className={styles.catchUpSubject}>{item.subjectName}</h3>
                          <p className={styles.catchUpLecture}>
                            {item.lectureLabel && item.lectureLabel !== item.subjectName
                              ? `${item.lectureLabel} · ${item.dateLabel}`
                              : item.dateLabel}
                          </p>
                        </div>
                        {item.hasRecording ? (
                          <span className={styles.catchUpBadge}>Recording available</span>
                        ) : null}
                      </div>
                      <p className={styles.catchUpSuggestion}>{item.suggestion}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.assignmentsEmptyState}>{catchUp.emptyMessage}</p>
              )}
            </section>
          </div>
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
                {getSectionMeta(todayOverview.pendingAssignments?.available, "Live items")}
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
