"use client";

import { startTransition, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

const appLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/contest", label: "Contest" },
  { href: "/chat", label: "Ask Academos" },
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
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-brand">
          <span className="site-brand-title">Academos</span>
          <span className="site-brand-copy">student academic guide</span>
        </Link>

        <nav className="site-nav" aria-label="Primary">
          {isLoading ? <span className="site-session-pill">Checking session...</span> : null}

          {!isLoading && user
            ? appLinks.map((link) => (
                <Link key={link.href} href={link.href} className="site-nav-link">
                  {link.label}
                </Link>
              ))
            : null}

          {!isLoading && !user ? (
            <>
              <Link href="/auth?mode=login" className="site-nav-link">
                Login
              </Link>
              <Link href="/auth?mode=signup" className="site-nav-link site-nav-link-accent">
                Sign Up
              </Link>
            </>
          ) : null}

          {!isLoading && user ? (
            <>
              <span className="site-session-pill">{user.email}</span>
              <button
                type="button"
                className="site-nav-button"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </>
          ) : null}
        </nav>
      </div>

      {logoutError ? <p className="site-header-message">{logoutError}</p> : null}
    </header>
  );
}
