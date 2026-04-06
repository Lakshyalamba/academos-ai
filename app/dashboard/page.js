import Link from "next/link";
import DashboardClient from "./DashboardClient";
import styles from "./dashboard.module.css";
import TodoListCard from "./TodoListCard";

export default function DashboardPage() {
  return (
    <main className="page-shell">
      <section className={styles.header}>
        <p className="eyebrow">Dashboard</p>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>Academic Dashboard</h1>
            <p className="page-copy">
              Everything you need for the day, from classes and pending work to
              attendance and catch-up.
            </p>
          </div>

          <Link href="/" className="text-link">
            Back to home
          </Link>
        </div>
      </section>

      <TodoListCard />
      <DashboardClient />
    </main>
  );
}
