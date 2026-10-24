import { Brand, GITHUB_URL } from "./brand";
import { ExternalIcon } from "./icons";
export function Footer() {
    return <footer className="landing-footer"><div className="landing-container"><div className="footer-top"><div><Brand /><p>For a more considered answer.</p></div><a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">Built in the open. <span>GitHub <ExternalIcon className="small-icon" /></span><span className="sr-only"> (opens in a new tab)</span></a></div><div className="footer-bottom"><p>AI-generated results require your review. Source support is not independent fact-checking.</p><span>Demo / simulated data</span></div></div></footer>;
}
