import Link from "next/link";
import styles from "./dashboard.module.css";
import { getRuntimeStatus } from "../../lib/runtime-status";

export default function DashboardPage() {
  const runtimeStatus = getRuntimeStatus();
  const { newtonConfigured, llmConfigured, supabaseConfigured } =
    runtimeStatus.config;
  const statusPills = [
    {
      label: "Records",
      value: newtonConfigured ? "Ready" : "Missing",
      helper: "Newton-backed academic data",
    },
    {
      label: "Reasoning",
      value: llmConfigured ? "Ready" : "Missing",
      helper: "Gemini response generation",
    },
    {
      label: "Saved snapshots",
      value: supabaseConfigured ? "Enabled" : "Optional",
      helper: "Supabase persistence layer",
    },
  ];
  const statusCards = [
    {
      label: "Readiness",
      title: "Live Answer Readiness",
      description:
        "Academos only answers with verified student data when the live services behind it are ready.",
      items: [
        `Newton MCP connection: ${newtonConfigured ? "Ready" : "Missing"}`,
        `Gemini reasoning: ${llmConfigured ? "Ready" : "Missing"}`,
        `Supabase snapshot storage: ${supabaseConfigured ? "Enabled" : "Optional and off"}`,
      ],
    },
    {
      label: "Trust",
      title: "Trust Safeguards",
      description:
        "This dashboard explains the trust rules behind the demo instead of showing invented student data.",
      items: [
        "Student-facing answers must be grounded in Newton-backed records.",
        "If live academic data is unavailable, the app should say Data not found.",
      ],
    },
    {
      label: "Flow",
      title: "How A Live Answer Is Prepared",
      description:
        "Use the chat experience to fetch fresh records, prepare a structured snapshot, and return a concise answer.",
      items: [
        "Newton fetches the verified academic record before an answer is generated.",
        supabaseConfigured
          ? "Supabase is saving the snapshot before reasoning runs."
          : "Supabase remains available, but the current run uses the in-memory snapshot path.",
        newtonConfigured && llmConfigured
          ? supabaseConfigured
            ? "Setup is complete. The chat flow can fetch, save, and explain a live snapshot."
            : "Setup is complete. The chat flow can explain live data without persistence."
          : runtimeStatus.missing[0] ||
            "Complete the missing configuration before running live academic answers.",
      ],
    },
  ];

  return (
    <main className="page-shell">
      <section className={styles.header}>
        <p className="eyebrow">Dashboard</p>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>Readiness Dashboard</h1>
            <p className="page-copy">
              Check whether Academos can safely answer with live academic data.
              This page covers readiness and trust, not student record content.
            </p>
          </div>

          <Link href="/" className="text-link">
            Back to home
          </Link>
        </div>
      </section>

      <section className={styles.statusStrip} aria-label="Readiness summary">
        {statusPills.map((item) => (
          <article key={item.label} className={styles.statusPill}>
            <p className={styles.statusLabel}>{item.label}</p>
            <p className={styles.statusValue}>{item.value}</p>
            <p className={styles.statusHelper}>{item.helper}</p>
          </article>
        ))}
      </section>

      <section className={styles.grid} aria-label="Dashboard sections">
        {statusCards.map((section) => (
          <article key={section.title} className={styles.card}>
            <p className={styles.cardLabel}>{section.label}</p>
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

      <details className={styles.detailsCard}>
        <summary className={styles.detailsSummary}>Technical details</summary>
        <div className={styles.detailsBody}>
          <p className={styles.detailsText}>
            Runtime configuration stays available for demos, but it is kept out
            of the main student-facing content by default.
          </p>
          <ul className={styles.detailsList}>
            <li>Newton MCP: {newtonConfigured ? "Ready" : "Missing"}</li>
            <li>Gemini: {llmConfigured ? "Ready" : "Missing"}</li>
            <li>
              Supabase: {supabaseConfigured ? "Enabled for snapshot storage" : "Optional and currently off"}
            </li>
            {runtimeStatus.commands.restartDevServer ? (
              <li>
                Dev server command: <code>{runtimeStatus.commands.restartDevServer}</code>
              </li>
            ) : null}
          </ul>
        </div>
      </details>
    </main>
  );
}
