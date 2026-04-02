import Link from "next/link";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/chat", label: "Ask Academos" },
];

export default function Navbar() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-brand">
          <span className="site-brand-title">Academos</span>
          <span className="site-brand-copy">student academic guide</span>
        </Link>

        <nav className="site-nav" aria-label="Primary">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="site-nav-link">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
