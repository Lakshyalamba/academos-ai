"use client";

import { useEffect, useState } from "react";
import { getApiUrl } from "../../lib/public-config";
import ContestPrepCard from "./ContestPrepCard";
import ProgressSummaryCard from "./ProgressSummaryCard";
import styles from "./dashboard.module.css";
import TodayTasksCard from "./TodayTasksCard";

function getInitialDashboardState() {
  return {
    todayOverview: {
      available: false,
      message: "Loading today's academic overview...",
      classesTodayCount: null,
      pendingAssignmentsCount: null,
      overdueItemsCount: null,
      classesSchedule: {
        available: false,
        today: [],
        tomorrow: [],
        todayEmptyMessage: "Loading today's classes...",
        tomorrowEmptyMessage: "Loading tomorrow's classes...",
      },
      pendingAssignments: {
        available: false,
        items: [],
        emptyMessage: "Loading pending assignments...",
      },
    },
    attendanceAlert: {
      available: false,
      state: "unavailable",
      averageLabel: null,
      subjectCount: 0,
      explanation: "Loading attendance details...",
      subjects: [],
    },
    catchUp: {
      available: false,
      items: [],
      emptyMessage: "Loading recent lecture activity...",
    },
  };
}

function getAssignmentsSummary(items) {
  const overdueCount = items.filter((item) => item.overdue).length;

  if (items.length === 0) {
    return "No open work";
  }

  if (overdueCount === 0) {
    return `${items.length} active`;
  }

  return `${overdueCount} overdue`;
}

function getAssignmentBuckets(overdueAssignments, upcomingAssignments) {
  const buckets = [];

  if (overdueAssignments.length > 0) {
    buckets.push({
      key: "overdue",
      title: "Needs attention",
      meta: `${overdueAssignments.length} item${
        overdueAssignments.length === 1 ? "" : "s"
      }`,
      items: overdueAssignments,
      emptyMessage: "No overdue assignments.",
    });
  }

  if (upcomingAssignments.length > 0) {
    buckets.push({
      key: "upcoming",
      title: "Up next",
      meta: `${upcomingAssignments.length} item${
        upcomingAssignments.length === 1 ? "" : "s"
      }`,
      items: upcomingAssignments,
      emptyMessage: "No upcoming assignments right now.",
    });
  }

  return buckets;
}

function AssignmentBucket({ title, meta, items, emptyMessage }) {
  return (
    <article className={styles.assignmentBucket}>
      <div className={styles.assignmentBucketHeader}>
        <h3 className={styles.assignmentBucketTitle}>{title}</h3>
        <span className={styles.bucketMeta}>{meta}</span>
      </div>

      {items.length ? (
        <ul className={styles.assignmentList}>
          {items.map((item) => (
            <li
              key={`${item.title}-${item.subjectName}-${item.dueTimestamp || item.dueAt || "no-date"}`}
              className={styles.assignmentItem}
            >
              <div className={styles.assignmentContent}>
                <p className={styles.assignmentTitle}>{item.title}</p>
                <p className={styles.assignmentSubject}>{item.subjectName}</p>
              </div>

              <div className={styles.assignmentMetaGroup}>
                <span
                  className={
                    item.overdue ? styles.assignmentBadgeOverdue : styles.assignmentBadge
                  }
                >
                  {item.overdue ? "Overdue" : item.dueAt ? `Due ${item.dueAt}` : "No due date"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.inlineState}>{emptyMessage}</p>
      )}
    </article>
  );
}

export default function DashboardClient() {
  const [data, setData] = useState(getInitialDashboardState);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadDashboard() {
      try {
        const response = await fetch(getApiUrl("/api/dashboard"), {
          cache: "no-store",
        });
        const payload = await response.json();

        if (!isActive) {
          return;
        }

        if (!response.ok) {
          throw new Error(payload?.error || "Unable to load dashboard data right now.");
        }

        setData({
          todayOverview: payload?.todayOverview || getInitialDashboardState().todayOverview,
          attendanceAlert: payload?.attendanceAlert || getInitialDashboardState().attendanceAlert,
          catchUp: payload?.catchUp || getInitialDashboardState().catchUp,
        });
        setErrorMessage("");
        setStatusMessage(typeof payload?.notice === "string" ? payload.notice : "");
      } catch (error) {
        if (!isActive) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Unable to load dashboard data right now.";

        setErrorMessage(message);
        setStatusMessage("");
        setData((currentData) => ({
          ...currentData,
          todayOverview: {
            ...currentData.todayOverview,
            message: "Live dashboard data is unavailable right now.",
          },
          attendanceAlert: {
            ...currentData.attendanceAlert,
            explanation: "Attendance details are unavailable right now.",
          },
          catchUp: {
            ...currentData.catchUp,
            emptyMessage: "Catch-up activity is unavailable right now.",
          },
        }));
      }
    }

    loadDashboard();

    return () => {
      isActive = false;
    };
  }, []);

  const { todayOverview, attendanceAlert, catchUp } = data;
  const pendingAssignments = Array.isArray(todayOverview.pendingAssignments?.items)
    ? todayOverview.pendingAssignments.items
    : [];
  const overdueAssignments = pendingAssignments.filter((item) => item.overdue);
  const upcomingAssignments = pendingAssignments.filter((item) => !item.overdue);
  const assignmentBuckets = getAssignmentBuckets(overdueAssignments, upcomingAssignments);

  return (
    <>
      {errorMessage || statusMessage ? (
        <div
          className={styles.statusBanner}
          role={errorMessage ? "alert" : "status"}
        >
          <p className={styles.statusBannerText}>{errorMessage || statusMessage}</p>
        </div>
      ) : null}

      <section className={styles.dashboardShell} aria-label="Dashboard content">
        <div className={styles.dashboardMain}>
          <TodayTasksCard
            classesSchedule={todayOverview.classesSchedule}
            catchUp={catchUp}
            classesTodayCount={todayOverview.classesTodayCount}
          />

          <section className={styles.dashboardCard} aria-label="Pending assignments">
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleBlock}>
                <p className={styles.cardLabel}>Pending Assignments</p>
                <h2 className={styles.sectionTitle}>Pending assignments</h2>
                <p className={styles.sectionDescription}>
                  Compact, grouped, and easy to scan.
                </p>
              </div>
              <p className={styles.cardMeta}>{getAssignmentsSummary(pendingAssignments)}</p>
            </div>

            {pendingAssignments.length ? (
              <div
                className={`${styles.assignmentsGrid} ${
                  assignmentBuckets.length === 1 ? styles.assignmentsGridSingle : ""
                }`}
              >
                {assignmentBuckets.map((bucket) => (
                  <AssignmentBucket
                    key={bucket.key}
                    title={bucket.title}
                    meta={bucket.meta}
                    items={bucket.items}
                    emptyMessage={bucket.emptyMessage}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.stateBox}>
                <p className={styles.stateTitle}>
                  {todayOverview.pendingAssignments?.emptyMessage ||
                    "No pending assignments found in the current live snapshot."}
                </p>
                <p className={styles.stateCopy}>
                  Open work will appear here in a shorter, grouped layout.
                </p>
              </div>
            )}
          </section>
        </div>

        <aside className={styles.dashboardSide}>
          <ProgressSummaryCard
            todayOverview={todayOverview}
            attendanceAlert={attendanceAlert}
          />
          <ContestPrepCard />
        </aside>
      </section>
    </>
  );
}
