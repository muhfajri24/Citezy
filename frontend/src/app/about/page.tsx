import { EvidencePreview } from "@/components/landing/evidence-preview";
import { loadLandingPreview } from "@/lib/api/landing-preview";
import { Navigation } from "@/components/landing/navigation";
import { Hero } from "@/components/landing/hero";

import { HowItWorks } from "@/components/landing/how-it-works";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import { EvidenceConstellation } from "@/components/evidence/constellation";

export default async function About() {
    const preview = await loadLandingPreview();
    return <div className="landing-page landing-overhaul"><Navigation active="about" /><main id="main" tabIndex={-1}><Hero /><section className="landing-container about-explanation"><h2>What is Citezy?</h2><p>Citezy is an evidence-first AI research workbench that helps users inspect the evidence behind AI-generated claims.</p><p>DEMO ONLY &#8212; Illustrative research data</p></section><section id="evidence-map" className="landing-container constellation-section" aria-label="Explore the evidence constellation"><EvidenceConstellation run={preview} /></section><HowItWorks run={preview} /><EvidencePreview run={preview} /><Features /><section className="landing-container about-explanation"><h2>Understanding support labels</h2><dl><dt>Supported by excerpt.</dt><dd>The supplied excerpt supports the claim within its stated scope.</dd><dt>Partially supported.</dt><dd>The excerpt supports only part of the claim or includes qualifications.</dd><dt>Unsupported.</dt><dd>The supplied evidence does not support the claim. This does not prove it false.</dd></dl><h2>Research methodology and limitations</h2><p>Ask to Search to Read to Check to Report. Inspect original wording, attribution and evaluation conditions. Missing evidence remains missing; different methods may not be directly comparable.</p><p>Excerpt support does not independently verify the source.</p><p>AI-generated results require your review. Citezy does not independently verify research papers, experiments, or external sources.</p></section></main><Footer /></div>;
}
