import Link from "next/link";
import ChatClient from "./ChatClient";
import styles from "./chat.module.css";

export default function ChatPage() {
  return (
    <main className="page-shell">
      <section className={styles.header}>
        <p className="eyebrow">Chat</p>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>Ask Academos</h1>
            <p className="page-copy">
              Get a student-friendly answer based on your academic records.
              Ask about attendance, deadlines, quizzes, contests, schedule, or
              subject progress.
            </p>
          </div>

          <Link href="/" className="text-link">
            Back to home
          </Link>
        </div>
      </section>

      <ChatClient />
    </main>
  );
}
