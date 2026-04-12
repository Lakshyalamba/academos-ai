import { Suspense } from "react";
import AuthForm from "./AuthForm";
import { FiGrid, FiMessageSquare, FiTarget, FiCheckCircle, FiArrowRight } from "react-icons/fi";
import Link from "next/link";
import styles from "./auth.module.css";

export const metadata = {
  title: "Auth | Academos",
};

const features = [
  { icon: FiGrid, title: "Dashboard", desc: "View your academic overview at a glance", href: "/dashboard" },
  { icon: FiMessageSquare, title: "Chat", desc: "Ask anything about your academics", href: "/chat" },
  { icon: FiTarget, title: "Progress", desc: "Track your performance over time", href: "/dashboard" },
  { icon: FiCheckCircle, title: "Verified", desc: "Data from real academic records", href: "/dashboard" },
];

export default function AuthPage() {
  return (
    <main className="page-shell">
      <section className={`hero ${styles.authLayout}`}>
        <Suspense fallback={<div className={styles.loadingCard}>Loading...</div>}>
          <AuthForm />
        </Suspense>
        
        <div className={styles.introPanel}>
          <p className="eyebrow">Welcome</p>
          <h1 className={styles.introTitle}>Your academic assistant</h1>
          <p className={`hero-copy ${styles.introCopy}`}>
            Login to access your dashboard, chat, and track your progress.
          </p>
          
          <div className={styles.featureGrid}>
            {features.map((feature, index) => (
              <Link 
                key={feature.title} 
                href={feature.href}
                className={styles.featureCard}
                style={{ animationDelay: `${0.5 + index * 0.1}s` }}
              >
                <div className={styles.featureIconWrap}>
                  <feature.icon className={styles.featureIcon} />
                </div>
                <div className={styles.featureContent}>
                  <span className={styles.featureTitle}>{feature.title}</span>
                  <span className={styles.featureDesc}>{feature.desc}</span>
                </div>
                <FiArrowRight className={styles.featureArrow} />
              </Link>
            ))}
          </div>
          
          <p className={styles.introNote}>
            Explore the features before signing up
          </p>
        </div>
      </section>
    </main>
  );
}