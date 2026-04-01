import Link from "next/link";
import styles from "./dashboard.module.css";
import { getRuntimeStatus } from "../../lib/runtime-status";

export default function DashboardPage() {
  const runtimeStatus = getRuntimeStatus();
  const { newtonConfigured, llmConfigured, supabaseConfigured } =
    runtimeStatus.config;
  const statusCards = [
    {
      title: "Backend Readiness",
      description:
        "The live academic flow requires Newton MCP and Gemini reasoning before any student data can be surfaced safely. Supabase persistence is optional.",
      items: [
        `Newton MCP in Codex: ${newtonConfigured ? "Yes" : "No"}`,
        `Supabase configured: ${supabaseConfigured ? "Yes" : "No"}`,
        `Gemini configured: ${llmConfigured ? "Yes" : "No"}`,
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
        "Use the chat flow to fetch Newton data, optionally persist it in Supabase, and reason over the available academic snapshot.",
      items: [
        supabaseConfigured
          ? "Flow: Newton MCP -> Backend -> Supabase -> Gemini -> UI"
          : "Flow: Newton MCP -> Backend -> Gemini -> UI",
        newtonConfigured && llmConfigured
          ? supabaseConfigured
            ? "Configuration is present. Chat can create and persist a live snapshot."
            : "Configuration is present. Chat can run without persistence."
          : runtimeStatus.missing[0] ||
            "Complete the missing configuration before running academic reasoning.",
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
