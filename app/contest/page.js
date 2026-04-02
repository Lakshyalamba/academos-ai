import Link from "next/link";
import ContestPrepForm from "./ContestPrepForm";
import { getContestHistory } from "../../lib/contest-history";
import styles from "./contest.module.css";

const prepHighlights = [
  "Upcoming contest schedule and readiness cards",
  "Prep focus areas and revision checkpoints",
  "Student-friendly contest overview without extra clutter",
];

const guidancePoints = [
  "AI prep suggestions will appear here once contest coaching is enabled.",
  "This section is reserved for future practice plans, warm-up guidance, and strategy support.",
];

export const dynamic = "force-dynamic";

export default async function ContestPage() {
  const contestHistory = await getContestHistory();

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
        <section className={styles.primaryCard}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.cardLabel}>Upcoming Contest Prep</p>
              <h2 className={styles.cardTitle}>Get ready for the next contest</h2>
              <p className={styles.cardDescription}>
                Enter the upcoming Friday contest details and keep the structure
                ready for future prep workflows.
              </p>
            </div>
            <p className={styles.cardMeta}>Manual entry</p>
          </div>

          <ContestPrepForm />
        </section>

        <section className={styles.secondaryCard}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.cardLabel}>AI Prep Guidance</p>
              <h2 className={styles.cardTitle}>Future contest coaching space</h2>
              <p className={styles.cardDescription}>
                Reserved for guided prep suggestions once contest AI support is enabled.
              </p>
            </div>
            <p className={styles.cardMeta}>Coming later</p>
          </div>

          <ul className={styles.noteList}>
            {guidancePoints.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
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
            {contestHistory.available ? "Live records" : "Unavailable"}
          </p>
        </div>

        {contestHistory.subjectCards.length ? (
          <div className={styles.scoresContent}>
            {contestHistory.progressLabel ? (
              <p className={styles.scoresSummary}>{contestHistory.progressLabel}</p>
            ) : null}

            <div className={styles.subjectScoresGrid}>
              {contestHistory.subjectCards.map((subject) => (
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
            <p className={styles.emptyStateTitle}>{contestHistory.emptyMessage}</p>
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
