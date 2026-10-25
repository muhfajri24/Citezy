import Link from "next/link";
import { Navigation } from "@/components/landing/navigation";
import { ResearchInput } from "@/components/landing/research-input";
export default function Home() {
 return <div className="landing-page landing-overhaul product-home"><Navigation active="research" /><main id="main" tabIndex={-1}>
 <div className="product-intro landing-container"><p className="section-kicker">CITEZY / EVIDENCE-FIRST RESEARCH</p><h1>Don&apos;t just cite it. <em>Check it.</em></h1><p>Ask a question. Inspect the claims. Follow the evidence.</p></div><ResearchInput />
 <div className="product-workflow landing-container"><p>Question &#8594; Sources &#8594; Claims &#8594; Evidence</p><p>A citation is a starting point. Read the excerpt and its limitations before relying on a claim.</p><Link href="/about">How Citezy works &#8599;</Link></div></main></div>;
}
