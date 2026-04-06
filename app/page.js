import Link from "next/link";
import styles from "./home.module.css";

const routes = [
  {
    href: "/chat",
    label: "Student assistant",
    title: "Ask what matters right now",
    description:
      "Get a clean summary, next tasks, and practical insights grounded in your academic records.",
  },
  {
    href: "/dashboard",
    label: "Demo readiness",
    title: "Check live answer readiness",
    description:
      "Confirm that Academos can safely fetch verified records before you show the product.",
  },
];

const highlights = [
  {
    title: "Clear next steps",
    description:
      "Academos turns scattered academic updates into a short answer you can act on quickly.",
  },
  {
    title: "Verified answers",
    description:
      "Responses stay tied to your academic records instead of inventing attendance, deadlines, or scores.",
  },
  {
    title: "Built for student questions",
    description:
      "Ask about attendance, assignments, quizzes, contests, schedule, and subject progress in plain language.",
  },
];

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className={`hero ${styles.heroGrid}`}>
        <div className={styles.heroCopy}>
          <div>
            <p className="eyebrow">Student Academic Assistant</p>
            <h1 className={styles.heroTitle}>Stay ahead of classes, deadlines, and what to do next.</h1>
            <p className={`hero-copy ${styles.heroLead}`}>
              Academos gives students a verified academic snapshot with a simple
              summary, clear next tasks, and useful insights for the week ahead.
            </p>
          </div>

          <div className={styles.heroActions}>
            <Link href="/auth?mode=signup" className="button-primary">
              Sign Up
            </Link>
            <Link href="/auth?mode=login" className="button-secondary">
              Login
            </Link>
          </div>

          <p className={styles.heroActionHint}>
            Start on the landing page, then log in to unlock the dashboard,
            contest workspace, and student assistant.
          </p>

          <div className={styles.heroChips} aria-label="Key product highlights">
            <span className={styles.heroChip}>Attendance and schedule guidance</span>
            <span className={styles.heroChip}>Assignments, quizzes, and contests</span>
            <span className={styles.heroChip}>Actionable answers, not raw records</span>
          </div>
        </div>

        <aside className={styles.heroPanel}>
          <p className={styles.heroPanelLabel}>Popular questions</p>
          <h2 className={styles.heroPanelTitle}>Useful when you need a fast academic check-in</h2>
          <p className={styles.heroPanelCopy}>
            Ask what needs attention today, what is slipping, or what is coming
            up next without digging through multiple academic views.
          </p>
          <ul className={styles.heroPanelList}>
            <li>What should I focus on this week?</li>
            <li>Do I have any overdue work or attendance risk?</li>
            <li>What is coming up in my schedule and assessments?</li>
          </ul>
        </aside>
      </section>

      <section className="card-grid" aria-label="Primary navigation">
        {routes.map((route) => (
          <Link key={route.href} href={route.href} className="nav-card">
            <span className={styles.navCardLabel}>{route.label}</span>
            <span className="nav-card-title">{route.title}</span>
            <span className="nav-card-copy">{route.description}</span>
          </Link>
        ))}
      </section>

      <section className={styles.sectionStack} aria-label="Product highlights">
        <p className={styles.sectionLabel}>Why Academos feels useful</p>
        <div className={styles.infoGrid}>
          {highlights.map((highlight) => (
            <article key={highlight.title} className={styles.infoCard}>
              <h2 className={styles.infoTitle}>{highlight.title}</h2>
              <p className={styles.infoCopy}>{highlight.description}</p>
            </article>
          ))}
        </div>
      </section>

      <details className={`content-card ${styles.detailsCard}`}>
        <summary className={styles.detailsSummary}>Technical details</summary>
        <div className={styles.detailsBody}>
          <p>
            Academos keeps the backend workflow intact: student records are
            fetched through Newton MCP, saved in Supabase when persistence is
            enabled, and then passed to Gemini for a structured response.
          </p>
          <ul className={styles.detailsList}>
            <li>Newton MCP remains the source of verified academic data.</li>
            <li>Gemini formats the final summary, tasks, and insights.</li>
            <li>Supabase support stays available for persisted snapshots.</li>
          </ul>
        </div>
      </details>
    </main>
  );
}
