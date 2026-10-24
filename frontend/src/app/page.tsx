import { EvidencePreview } from "@/components/landing/evidence-preview";
import { loadLandingPreview } from "@/lib/api/landing-preview";
import { Navigation } from "@/components/landing/navigation";
import { Hero } from "@/components/landing/hero";
import { ResearchInput } from "@/components/landing/research-input";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import { EvidenceConstellation } from "@/components/evidence/constellation";

export default async function Home() {
    const preview = await loadLandingPreview();
    return <div className="landing-page landing-overhaul"><Navigation /><main id="main" tabIndex={-1}><Hero /><ResearchInput /><section id="evidence-map" className="landing-container constellation-section" aria-label="Explore the evidence constellation"><EvidenceConstellation run={preview} /></section><HowItWorks run={preview} /><EvidencePreview run={preview} /><Features /></main><Footer /></div>;
}
