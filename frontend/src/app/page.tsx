import { EvidencePreview } from "@/components/landing/evidence-preview";
import { loadLandingPreview } from "@/lib/api/landing-preview";
import { Navigation } from "@/components/landing/navigation";
import { Hero } from "@/components/landing/hero";
import { ResearchInput } from "@/components/landing/research-input";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";

export default async function Home() {
    const preview = await loadLandingPreview();
    return <div className="landing-page"><Navigation /><main id="main" tabIndex={-1}><Hero /><ResearchInput /><HowItWorks run={preview} /><EvidencePreview run={preview} /><Features /></main><Footer /></div>;
}
