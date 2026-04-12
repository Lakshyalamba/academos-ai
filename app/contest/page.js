import Link from "next/link";
import { FiTarget, FiCalendar, FiTrendingUp, FiArrowLeft } from "react-icons/fi";
import ContestPageClient from "./ContestPageClient";
import styles from "./contest.module.css";

export default function ContestPage() {
  const highlights = [
    { icon: FiTarget, text: "Prepare" },
    { icon: FiCalendar, text: "Schedule" },
    { icon: FiTrendingUp, text: "Performance" },
  ];

  return (
    <main className="page-shell">
      <section className={styles.header}>
        <div className={styles.headerRow}>
          <div className={styles.headerCopy}>
            <h1 className={styles.title}>Contest Prep</h1>
            <p className={styles.subtitle}>Prepare for your next contest</p>
          </div>

          <Link href="/" className={styles.homeLink}>
            <FiArrowLeft /> Home
          </Link>
        </div>

        <div className={styles.highlightRow}>
          {highlights.map((item, index) => (
            <div 
              key={item.text} 
              className={styles.highlightChip}
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
            >
              <item.icon className={styles.chipIcon} />
              {item.text}
            </div>
          ))}
        </div>
      </section>

      <ContestPageClient />
    </main>
  );
}