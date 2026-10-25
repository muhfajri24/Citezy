import { Brand, GITHUB_URL } from "./brand";
import Link from "next/link";
import { ExternalIcon } from "./icons";
export function Navigation({ active }: { active?: "research" | "about" }) {
    return <header className="landing-nav"><div className="landing-container nav-inner">
        <Brand />
        <nav aria-label="Main navigation" className="nav-links">
            <Link href="/" aria-current={active === "research" ? "page" : undefined}>Research</Link><Link href="/about" aria-current={active === "about" ? "page" : undefined}>About</Link>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="nav-github">GitHub <ExternalIcon className="small-icon" /><span className="sr-only"> (opens in a new tab)</span></a>

        </nav>
    </div></header>;
}
