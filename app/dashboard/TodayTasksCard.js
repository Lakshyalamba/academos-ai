"use client";

import styles from "./dashboard.module.css";
import TodoListCard from "./TodoListCard";

function getClassCountLabel(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return "No classes";
  }

  return `${items.length} ${items.length === 1 ? "class" : "classes"}`;
}

function ScheduleDay({ label, items, emptyMessage }) {
  return (
    <article className={styles.scheduleDayCard}>
      <div className={styles.scheduleDayHeader}>
        <h3 className={styles.subCardTitle}>{label}</h3>
        <span className={styles.bucketMeta}>{getClassCountLabel(items)}</span>
      </div>

      {items.length ? (
        <ul className={styles.scheduleList}>
          {items.map((entry) => (
            <li
              key={`${entry.subjectName}-${entry.time}-${entry.type}`}
              className={styles.scheduleItem}
            >
              <div className={styles.scheduleItemBody}>
                <p className={styles.scheduleSubject}>{entry.subjectName}</p>
                <p className={styles.scheduleMetaText}>{entry.type || "Class"}</p>
              </div>
              <span className={styles.assignmentBadge}>{entry.time}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.inlineState}>{emptyMessage}</p>
      )}
    </article>
  );
}

export default function TodayTasksCard({
  classesSchedule,
  catchUp,
  classesTodayCount,
}) {
  const todayClasses = Array.isArray(classesSchedule?.today) ? classesSchedule.today : [];
  const tomorrowClasses = Array.isArray(classesSchedule?.tomorrow)
    ? classesSchedule.tomorrow
    : [];
  const catchUpItems = Array.isArray(catchUp?.items) ? catchUp.items : [];
  const agendaLabel =
    typeof classesTodayCount === "number"
      ? `${classesTodayCount} today`
      : classesSchedule?.available
        ? "Schedule ready"
        : "Sync unavailable";

  return (
    <section className={styles.dashboardCard} aria-label="Today's tasks">
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleBlock}>
          <p className={styles.cardLabel}>Today&apos;s Tasks</p>
          <h2 className={styles.sectionTitle}>Today&apos;s tasks</h2>
          <p className={styles.sectionDescription}>Tasks, classes, and catch-up.</p>
        </div>
        <p className={styles.cardMeta}>{agendaLabel}</p>
      </div>

      <div className={styles.todayTasksGrid}>
        <div className={styles.todayTodoArea}>
          <TodoListCard />
        </div>

        <section className={`${styles.subCard} ${styles.todayScheduleCard}`}>
          <div className={styles.subCardHeader}>
            <div className={styles.sectionTitleBlock}>
              <p className={styles.cardLabel}>Class Schedule</p>
              <h3 className={styles.subCardTitle}>Today and tomorrow</h3>
            </div>
            <p className={styles.cardMeta}>
              {classesSchedule?.available ? "Live schedule" : "Unavailable"}
            </p>
          </div>

          <div className={styles.scheduleGrid}>
            <ScheduleDay
              label="Today"
              items={todayClasses}
              emptyMessage={
                classesSchedule?.todayEmptyMessage || "No classes scheduled today."
              }
            />
            <ScheduleDay
              label="Tomorrow"
              items={tomorrowClasses}
              emptyMessage={
                classesSchedule?.tomorrowEmptyMessage ||
                "No classes scheduled tomorrow."
              }
            />
          </div>
        </section>

        <section className={`${styles.subCard} ${styles.todayCatchUpCard}`}>
          <div className={styles.subCardHeader}>
            <div className={styles.sectionTitleBlock}>
              <p className={styles.cardLabel}>Catch Up</p>
              <h3 className={styles.subCardTitle}>Recent missed lectures</h3>
            </div>
            <p className={styles.cardMeta}>
              {catchUp?.available ? "Live activity" : "Unavailable"}
            </p>
          </div>

          {catchUpItems.length ? (
            <ul className={styles.catchUpList}>
              {catchUpItems.map((item) => (
                <li key={item.id} className={styles.catchUpItem}>
                  <div className={styles.catchUpItemBody}>
                    <p className={styles.catchUpSubject}>{item.subjectName}</p>
                    <p className={styles.catchUpLecture}>
                      {item.lectureLabel && item.lectureLabel !== item.subjectName
                        ? `${item.lectureLabel} · ${item.dateLabel}`
                        : item.dateLabel}
                    </p>
                    <p className={styles.catchUpSuggestion}>{item.suggestion}</p>
                  </div>

                  {item.hasRecording ? (
                    <span className={styles.assignmentBadge}>Recording</span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.inlineState}>
              {catchUp?.emptyMessage || "You&apos;re caught up on recent lectures."}
            </p>
          )}
        </section>
      </div>
    </section>
  );
}
