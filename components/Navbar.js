"use client";

import { startTransition, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { FiGrid, FiMessageSquare, FiLogOut, FiUser } from "react-icons/fi";
import styles from "./Navbar.module.css";

const appLinks = [
  { href: "/dashboard", label: "Dashboard", icon: FiGrid },
  { href: "/contest", label: "Contest", icon: null },
  { href: "/chat", label: "Ask", icon: FiMessageSquare },
];

export default function Navbar() {
  const router = useRouter();
  const { logout, user, isLoading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  async function handleLogout() {
    setIsLoggingOut(true);
    setLogoutError("");

    const result = await logout();

    if (!result.ok) {
      setLogoutError(result.error || "Unable to log out right now.");
      setIsLoggingOut(false);
      return;
    }

    startTransition(() => {
      router.push("/");
      router.refresh();
    });

    setIsLoggingOut(false);
  }

  return (
    <header className={styles.header}>
      <div className={styles.headerGlow} />
      <div className={styles.headerInner}>
        <Link href="/" className={styles.brand}>
          <div className={styles.brandIcon}>
            <span className={styles.brandIconText}>A</span>
          </div>
          <div className={styles.brandText}>
            <span className={styles.brandTitle}>Academos</span>
            <span className={styles.brandCopy}>student assistant</span>
          </div>
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          {isLoading ? (
            <span className={styles.sessionPill}>Loading...</span>
          ) : null}

          {!isLoading && user
            ? appLinks.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={styles.navLink}
                  style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                >
                  {link.icon && <link.icon className={styles.navIcon} />}
                  <span>{link.label}</span>
                </Link>
              ))
            : null}

          {!isLoading && !user ? (
            <>
              <Link href="/auth?mode=login" className={styles.navLink}>
                Login
              </Link>
              <Link href="/auth?mode=signup" className={styles.navLinkAccent}>
                Sign Up
              </Link>
            </>
          ) : null}

          {!isLoading && user ? (
            <>
              <div className={styles.userPill}>
                <FiUser className={styles.userIcon} />
                <span className={styles.userEmail}>{user.email?.split('@')[0]}</span>
              </div>
              <button
                type="button"
                className={styles.logoutBtn}
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <FiLogOut className={styles.logoutIcon} />
                <span>{isLoggingOut ? "..." : "Logout"}</span>
              </button>
            </>
          ) : null}
        </nav>
      </div>

      {logoutError ? <p className={styles.errorMessage}>{logoutError}</p> : null}
    </header>
  );
}