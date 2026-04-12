import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import ChatClient from "./ChatClient";
import styles from "./chat.module.css";

export default function ChatPage() {
  return (
    <main className="page-shell">
      <section className={styles.header}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>Student Assistant</h1>
            <p className={styles.subtitle}>Ask about your academics</p>
          </div>

          <Link href="/" className={styles.homeLink}>
            <FiArrowLeft /> Home
          </Link>
        </div>
      </section>

      <ChatClient />
    </main>
  );
}