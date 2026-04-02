import Link from "next/link";
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

const scoreHistoryNotes = [
  "Past contest scores and performance history will appear here once records are connected.",
  "You will be able to review previous results and progress over time in this section.",
];

export default function ContestPage() {
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
                A focused area for upcoming contest readiness and prep planning.
              </p>
            </div>
            <p className={styles.cardMeta}>Placeholder</p>
          </div>

          <div className={styles.emptyStateBox}>
            <p className={styles.emptyStateTitle}>Upcoming contest prep is not connected yet.</p>
            <p className={styles.emptyStateCopy}>
              Once contest schedule logic is added, this section can show the
              next contest, prep timing, and quick readiness cues.
            </p>
          </div>
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
              A clean place for contest history once score data is integrated.
            </p>
          </div>
          <p className={styles.cardMeta}>Placeholder</p>
        </div>

        <div className={styles.emptyStateBox}>
          <p className={styles.emptyStateTitle}>No contest history is connected yet.</p>
          <ul className={styles.noteList}>
            {scoreHistoryNotes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
