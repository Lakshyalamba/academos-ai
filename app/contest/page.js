import Link from "next/link";
import ContestGuidancePanel from "./ContestGuidancePanel";
import ContestPrepForm from "./ContestPrepForm";
import { getContestPageData } from "../../lib/contest-history";
import styles from "./contest.module.css";

const prepHighlights = [
  "Plan the next Friday contest in one place",
  "Get subject-aware revision guidance",
  "Review previous contest performance quickly",
];

export const dynamic = "force-dynamic";

export default async function ContestPage() {
  const contestPageData = await getContestPageData();

  return (
    <main className="page-shell">
      <section className={styles.header}>
        <p className="eyebrow">Contest</p>
        <div className={styles.headerRow}>
          <div className={styles.headerCopy}>
            <h1 className={styles.title}>Contest hub for prep, guidance, and performance.</h1>
            <p className="page-copy">
              This page brings contest preparation, future AI guidance, and
              past performance into one student-facing space.
            </p>
          </div>

          <Link href="/" className="text-link">
            Back to home
          </Link>
        </div>

        <div className={styles.highlightRow} aria-label="Contest page highlights">
          {prepHighlights.map((item) => (
            <span key={item} className={styles.highlightChip}>
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className={styles.contentGrid} aria-label="Contest sections">
        <section className={`${styles.primaryCard} ${styles.prepCard}`}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.cardLabel}>Upcoming Contest Prep</p>
              <h2 className={styles.cardTitle}>Get ready for the next contest</h2>
              <p className={styles.cardDescription}>
                {contestPageData.upcomingContest
                  ? `Newton currently lists ${contestPageData.upcomingContest.title} for ${contestPageData.upcomingContest.subjectName} on ${contestPageData.upcomingContest.dateLabel}. You can still use the manual form below to plan the week.`
                  : "Use this space every Monday to save the next Friday contest and keep your prep details organized."}
              </p>
            </div>
            <p className={styles.cardMeta}>
              {contestPageData.upcomingContest ? "Planner + live check" : "Weekly planner"}
            </p>
          </div>

          {contestPageData.upcomingContest ? (
            <div className={styles.upcomingContestPanel}>
              <div className={styles.upcomingContestHeader}>
                <div>
                  <p className={styles.cardLabel}>Live Upcoming Contest</p>
                  <h3 className={styles.upcomingContestTitle}>
                    {contestPageData.upcomingContest.title}
                  </h3>
                </div>
                <p className={styles.cardMeta}>Newton record</p>
              </div>

              <div className={styles.upcomingContestGrid}>
                <div className={styles.upcomingContestRow}>
                  <p className={styles.upcomingContestLabel}>Subject</p>
                  <p className={styles.upcomingContestValue}>
                    {contestPageData.upcomingContest.subjectName}
                  </p>
                </div>

                <div className={styles.upcomingContestRow}>
                  <p className={styles.upcomingContestLabel}>Date</p>
                  <p className={styles.upcomingContestValue}>
                    {contestPageData.upcomingContest.dateLabel}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <ContestPrepForm />
        </section>

        <section className={`${styles.secondaryCard} ${styles.guidanceCard}`}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.cardLabel}>AI Prep Guidance</p>
              <h2 className={styles.cardTitle}>Most important prep moves before the contest</h2>
              <p className={styles.cardDescription}>
                Guidance is generated from your saved contest details and related live
                Newton academic records for the same subject.
              </p>
            </div>
            <p className={styles.cardMeta}>Priority view</p>
          </div>

          <ContestGuidancePanel />
        </section>
      </section>

      <section className={styles.scoresCard}>
        <div className={styles.cardHeader}>
          <div>
            <p className={styles.cardLabel}>Past Contest Scores</p>
            <h2 className={styles.cardTitle}>Score history and previous results</h2>
            <p className={styles.cardDescription}>
              Only contest records from Newton are shown here, separate from
              assignments and quizzes.
            </p>
          </div>
          <p className={styles.cardMeta}>
            {contestPageData.status.available ? "Past records" : "Unavailable"}
          </p>
        </div>

        {contestPageData.pastContests.length ? (
          <div className={styles.scoresContent}>
            {contestPageData.pastContestSummary ? (
              <p className={styles.scoresSummary}>{contestPageData.pastContestSummary}</p>
            ) : null}

            <div className={styles.subjectScoresGrid}>
              {contestPageData.pastContests.map((subject) => (
                <article
                  key={subject.subjectName}
                  className={styles.subjectScoreCard}
                  aria-label={`${subject.subjectName} contest history`}
                >
                  <div className={styles.subjectScoreHeader}>
                    <div>
                      <p className={styles.cardLabel}>Subject</p>
                      <h3 className={styles.subjectScoreTitle}>{subject.subjectName}</h3>
                    </div>
                    <p className={styles.cardMeta}>
                      {subject.contestCount}{" "}
                      {subject.contestCount === 1 ? "contest" : "contests"}
                    </p>
                  </div>

                  <ul className={styles.subjectContestList}>
                    {subject.entries.map((entry) => (
                      <li key={entry.id} className={styles.subjectContestItem}>
                        <div>
                          <p className={styles.subjectContestName}>{entry.title}</p>
                          <p className={styles.subjectContestDate}>{entry.dateLabel}</p>
                        </div>

                        {entry.scoreLabel || entry.rankLabel ? (
                          <div className={styles.subjectContestMeta}>
                            {entry.scoreLabel ? (
                              <span className={styles.scoreChip}>{entry.scoreLabel}</span>
                            ) : null}
                            {entry.rankLabel ? (
                              <span className={styles.scoreChipMuted}>{entry.rankLabel}</span>
                            ) : null}
                          </div>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.emptyStateBox}>
            <p className={styles.emptyStateTitle}>{contestPageData.emptyMessage}</p>
            <p className={styles.emptyStateCopy}>
              This section stays contest-only, so it remains empty when live
              contest history is not available.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
