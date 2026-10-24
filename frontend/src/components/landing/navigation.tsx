import { Brand, GITHUB_URL } from "./brand";
import { ArrowIcon, ExternalIcon } from "./icons";
export function Navigation() {
    return <header className="landing-nav"><div className="landing-container nav-inner">
        <Brand />
        <nav aria-label="Main navigation" className="nav-links">
            <a href="#how-it-works" className="nav-how">How it works</a>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="nav-github">GitHub <ExternalIcon className="small-icon" /><span className="sr-only"> (opens in a new tab)</span></a>
            <a href="#research-question" className="nav-cta">Start researching <ArrowIcon className="small-icon" /></a>
        </nav>
    </div></header>;
}
