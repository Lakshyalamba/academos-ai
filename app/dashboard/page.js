import Link from "next/link";
import DashboardClient from "./DashboardClient";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  return (
    <main className="page-shell">
      <section className={styles.header}>
        <div className={styles.headerRow}>
          <div className={styles.headerCopyBlock}>
            <h1 className={styles.title}>Dashboard</h1>
          </div>

          <Link href="/" className={styles.headerLink}>
            Home
          </Link>
        </div>
      </section>

      <div className={styles.pageStack}>
        <DashboardClient />
      </div>
    </main>
  );
}
