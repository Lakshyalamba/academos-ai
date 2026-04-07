import Link from "next/link";
import DashboardClient from "./DashboardClient";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  return (
    <main className="page-shell">
      <section className={styles.header}>
        <div className={styles.headerRow}>
          <div className={styles.headerCopyBlock}>
            <p className="eyebrow">Dashboard</p>
            <h1 className={styles.title}>Academic dashboard</h1>
            <p className={styles.headerCopy}>
              Tasks, deadlines, attendance, and contest prep in one clean view.
            </p>
          </div>

          <Link href="/" className={styles.headerLink}>
            Back to home
          </Link>
        </div>
      </section>

      <div className={styles.pageStack}>
        <DashboardClient />
      </div>
    </main>
  );
}
