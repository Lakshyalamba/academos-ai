import { Suspense } from "react";
import AuthForm from "./AuthForm";
import styles from "./auth.module.css";

const authHighlights = [
  {
    title: "Keep access scoped",
    description:
      "Dashboard, chat, and contest tools stay behind a signed-in user session.",
  },
  {
    title: "Stay signed in",
    description:
      "Valid Supabase sessions persist across refreshes so students return to the app directly.",
  },
];

export const metadata = {
  title: "Auth | Academos",
  description: "Log in or create an Academos account to access the student workspace.",
};

export default function AuthPage() {
  return (
    <main className="page-shell">
      <section className={`hero ${styles.authLayout}`}>
        <div className={styles.introPanel}>
          <div>
            <p className="eyebrow">Account Access</p>
            <h1 className={styles.introTitle}>Authenticate once, then move straight into your academic workspace.</h1>
            <p className={`hero-copy ${styles.introCopy}`}>
              Academos keeps the landing page public, then protects the app
              workspace with email and password authentication before the
              dashboard, contest hub, and chat become available.
            </p>
          </div>

          <div className={styles.introGrid}>
            {authHighlights.map((item) => (
              <article key={item.title} className={styles.introCard}>
                <h2 className={styles.introCardTitle}>{item.title}</h2>
                <p className={styles.introCardCopy}>{item.description}</p>
              </article>
            ))}
          </div>

          <article className={styles.introCard}>
            <h2 className={styles.introCardTitle}>What happens after login</h2>
            <ul className={styles.introList}>
              <li>You land inside the app on the dashboard or the page you originally requested.</li>
              <li>The navbar switches to app navigation plus logout.</li>
              <li>Protected routes redirect back here when there is no valid session.</li>
            </ul>
          </article>
        </div>

        <Suspense fallback={<div className={styles.loadingCard}>Loading authentication form...</div>}>
          <AuthForm />
        </Suspense>
      </section>
    </main>
  );
}
