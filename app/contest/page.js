import Link from "next/link";
import ContestPageClient from "./ContestPageClient";
import styles from "./contest.module.css";

const prepHighlights = [
  "Plan the next Friday contest in one place",
  "Get subject-aware revision guidance",
  "Review previous contest performance quickly",
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

      <ContestPageClient />
    </main>
  );
}
