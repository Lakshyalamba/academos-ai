import Link from "next/link";
import styles from "./dashboard.module.css";
import { isClaudeConfigured } from "../../lib/claude";
import { isSupabaseConfigured } from "../../lib/supabase";

export default function DashboardPage() {
  const claudeConfigured = isClaudeConfigured();
  const supabaseConfigured = isSupabaseConfigured();
  const statusCards = [
    {
      title: "Backend Readiness",
      description:
        "The live academic flow requires both Supabase storage and Claude reasoning before any student data can be surfaced safely.",
      items: [
        `Supabase configured: ${supabaseConfigured ? "Yes" : "No"}`,
        `Claude configured: ${claudeConfigured ? "Yes" : "No"}`,
      ],
    },
    {
      title: "Data Integrity",
      description:
        "This dashboard no longer renders invented attendance, assignments, or performance data.",
      items: [
        "Academic answers must come from Newton MCP data only.",
        "If live data is unavailable, the app should say Data not found.",
      ],
    },
    {
      title: "Next Step",
      description:
        "Use the chat flow to sync Newton MCP data into Supabase, then reason over the stored record.",
      items: [
        "Flow: MCP -> Backend -> Supabase -> Claude -> UI",
        claudeConfigured && supabaseConfigured
          ? "Configuration is present. You can use the chat route to create a live snapshot."
          : "Complete the missing configuration before running academic reasoning.",
      ],
    },
  ];

  return (
    <main className="page-shell">
      <section className={styles.header}>
        <p className="eyebrow">Dashboard</p>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>System Dashboard</h1>
            <p className="page-copy">
              This page shows whether the live academic pipeline is ready. It
              does not display fabricated student data.
            </p>
          </div>

          <Link href="/" className="text-link">
            Back to home
          </Link>
        </div>
      </section>

      <section className={styles.grid} aria-label="Dashboard sections">
        {statusCards.map((section) => (
          <article key={section.title} className={styles.card}>
            <p className={styles.cardLabel}>Section</p>
            <h2 className={styles.cardTitle}>{section.title}</h2>
            <p className={styles.cardDescription}>{section.description}</p>

            <ul className={styles.cardList}>
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </main>
  );
}
