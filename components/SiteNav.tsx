import Link from "next/link";
import { Logo } from "./Logo";

/** Shared site nav — sticky, translucent, new light/blue brand system. */
export function SiteNav() {
  return (
    <header className="nav">
      <div className="wrap nav-inner">
        <Logo href="/" />

        <nav className="nav-links">
          <Link href="/explore">Explore</Link>
          <Link href="/verify">Verify</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/improve">Improve</Link>
          <Link href="/collections">Collections</Link>
          <Link href="/skills">My Skills</Link>
          <Link href="/teams">Teams</Link>
          <Link href="/install">Install</Link>
          <Link href="/faq">FAQ</Link>
        </nav>

        <div className="nav-spacer" />

        <div className="nav-cta">
          <Link className="btn-quiet btn" href="/auth">
            Sign in
          </Link>
          <Link className="btn btn-primary" href="/generate">
            Generate <span className="arr">→</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
