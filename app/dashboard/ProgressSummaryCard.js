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

function formatPercentage(value) {
  if (!Number.isFinite(value)) {
    return "Not available";
  }

  return `${value.toFixed(1)}%`;
}

function getAttendancePairKey(name) {
  return String(name || "")
    .replace(/\b2\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function sortAttendancePairLabels(labels) {
  return [...labels].sort((left, right) => {
    const leftHasTwo = /\b2\b/.test(left);
    const rightHasTwo = /\b2\b/.test(right);

    if (leftHasTwo !== rightHasTwo) {
      return leftHasTwo ? 1 : -1;
    }

    return left.localeCompare(right);
  });
}

function buildAttendancePairs(subjects) {
  const groups = new Map();

  for (const subject of subjects) {
    const name = String(subject?.name || "").trim();

    if (!name) {
      continue;
    }

    const key = getAttendancePairKey(name) || name;
    const existing = groups.get(key) || {
      key,
      names: [],
      attendedLectures: 0,
      totalLectures: 0,
    };

    existing.names.push(name);
    existing.attendedLectures += Number(subject?.attendedLectures) || 0;
    existing.totalLectures += Number(subject?.totalLectures) || 0;
    groups.set(key, existing);
  }

  return [...groups.values()]
    .map((group) => {
      const percentage =
        group.totalLectures > 0
          ? (group.attendedLectures / group.totalLectures) * 100
          : Number.NaN;

      return {
        id: group.key,
        label: sortAttendancePairLabels(group.names).join(" + "),
        attendedLectures: group.attendedLectures,
        totalLectures: group.totalLectures,
        percentage,
        percentageLabel: formatPercentage(percentage),
      };
    })
    .sort((left, right) => {
      if (left.percentage !== right.percentage) {
        return left.percentage - right.percentage;
      }

      return left.label.localeCompare(right.label);
    });
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
  const attendancePairs = buildAttendancePairs(subjects);

  return (
    <section className={styles.dashboardCard} aria-label="Progress summary">
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleBlock}>
          <h2 className={styles.sectionTitle}>Progress</h2>
        </div>
        <p className={styles.cardMeta}>
          {todayOverview.available ? "Live" : "Unavailable"}
        </p>
      </div>

      <div className={styles.progressStatsGrid}>
        {stats.map((item) => (
          <article key={item.label} className={styles.progressStatCard}>
            <p className={styles.progressStatLabel}>{item.label}</p>
            <p className={styles.progressStatValue}>{item.value}</p>
          </article>
        ))}
      </div>

      <section className={styles.attendanceSection}>
        <div className={styles.attendanceSummary}>
              <div className={styles.sectionTitleBlock}>
                <p className={styles.cardLabel}>Attendance</p>
                <h3 className={styles.subCardTitle}>Combined subject view</h3>
                <p className={styles.sectionDescription}>Paired subject attendance.</p>
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

        {attendanceAlert?.available && attendancePairs.length ? (
          <>
            <div className={styles.attendanceGrid}>
              {attendancePairs.map((subject) => (
                <article key={subject.id} className={styles.attendanceSubjectCard}>
                  <p className={styles.attendanceSubjectName}>{subject.label}</p>
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
            <p className={styles.stateTitle}>Attendance data unavailable</p>
          </div>
        )}
      </section>
    </section>
  );
}
