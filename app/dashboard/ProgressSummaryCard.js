"use client";

import styles from "./dashboard.module.css";

function getMetricValue(value, fallback = "Not available") {
  return typeof value === "number" ? String(value) : fallback;
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

function getAttendanceStateClass(state) {
  switch (state) {
    case "healthy":
      return styles.attendanceStateHealthy;
    case "watch":
      return styles.attendanceStateWatch;
    case "risk":
      return styles.attendanceStateRisk;
    default:
      return styles.attendanceStateUnavailable;
  }
}

export default function ProgressSummaryCard({ todayOverview, attendanceAlert }) {
  const stats = [
    {
      label: "Classes",
      value: getMetricValue(todayOverview.classesTodayCount),
      helper: "Scheduled today",
    },
    {
      label: "Assignments",
      value: getMetricValue(todayOverview.pendingAssignmentsCount),
      helper: "Open items",
    },
    {
      label: "Overdue",
      value: getMetricValue(todayOverview.overdueItemsCount),
      helper: "Needs attention",
    },
  ];

  const subjects = Array.isArray(attendanceAlert?.subjects) ? attendanceAlert.subjects : [];

  return (
    <section className={styles.dashboardCard} aria-label="Progress summary">
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleBlock}>
          <p className={styles.cardLabel}>Progress Summary</p>
          <h2 className={styles.sectionTitle}>Progress summary</h2>
          <p className={styles.sectionDescription}>
            A compact view of workload and attendance.
          </p>
        </div>
        <p className={styles.cardMeta}>
          {todayOverview.available ? "Live view" : "Fallback view"}
        </p>
      </div>

      <div className={styles.progressStatsGrid}>
        {stats.map((item) => (
          <article key={item.label} className={styles.progressStatCard}>
            <p className={styles.progressStatLabel}>{item.label}</p>
            <p className={styles.progressStatValue}>{item.value}</p>
            <p className={styles.progressStatHelper}>{item.helper}</p>
          </article>
        ))}
      </div>

      <section className={styles.attendanceSection}>
        <div className={styles.attendanceSummary}>
          <div className={styles.sectionTitleBlock}>
            <p className={styles.cardLabel}>Attendance</p>
            <h3 className={styles.subCardTitle}>Combined subject view</h3>
            <p className={styles.sectionDescription}>
              Final subject attendance shown in one compact row.
            </p>
          </div>

          <div className={styles.attendanceSummaryMeta}>
            <span
              className={`${styles.attendanceStateBadge} ${getAttendanceStateClass(
                attendanceAlert?.state,
              )}`}
            >
              {getAttendanceStateLabel(attendanceAlert?.state)}
            </span>
            <p className={styles.attendanceAverageValue}>
              {attendanceAlert?.averageLabel || "Not available"}
            </p>
          </div>
        </div>

        {attendanceAlert?.available && subjects.length ? (
          <>
            <p className={styles.attendanceSummaryCopy}>{attendanceAlert.explanation}</p>
            <div className={styles.attendanceGrid}>
              {subjects.map((subject) => (
                <article key={subject.name} className={styles.attendanceSubjectCard}>
                  <p className={styles.attendanceSubjectName}>{subject.name}</p>
                  <p className={styles.attendanceSubjectFormula}>Combined class + lab</p>
                  <p className={styles.attendanceSubjectRecord}>
                    {subject.attendedLectures}/{subject.totalLectures}
                  </p>
                  <p className={styles.attendanceSubjectValue}>
                    {subject.percentageLabel || "Not available"}
                  </p>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.stateBox}>
            <p className={styles.stateTitle}>{attendanceAlert?.explanation}</p>
            <p className={styles.stateCopy}>
              Attendance cards will appear here when the live record is available.
            </p>
          </div>
        )}
      </section>
    </section>
  );
}
