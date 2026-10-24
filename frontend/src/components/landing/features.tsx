import { Card } from "@/components/ui";
import { EvidenceIcon } from "./icons";
const FEATURES = [
    { icon: "link" as const, category: "TRACEABILITY", title: "Evidence-linked claims.", description: "A citation is a starting point. The workspace is designed to connect each claim to the excerpt behind it, with an explicit support assessment.", detail: "Claim → excerpt → source" },
    { icon: "source" as const, category: "TRANSPARENCY", title: "Sources, open to inspection.", description: "See where a finding comes from. Inspect the source, the provided excerpt, and the limits of what it actually supports.", detail: "Context over confidence" },
    { icon: "compare" as const, category: "PERSPECTIVE", title: "Compare with context.", description: "The planned comparison view puts methods, datasets and metrics side by side, flagging missing details and results that aren't directly comparable.", detail: "Keep the caveats in view" },
];
export function Features() {
    return <section className="features-section landing-container" aria-labelledby="features-title"><div className="section-heading"><div><p className="section-kicker">BUILT FOR A SECOND LOOK.</p><h2 id="features-title">Good research.<br /><em>Show your workings.</em></h2></div><p>The goal isn&apos;t a more confident answer.<br />It&apos;s an answer you can interrogate.</p></div><div className="features-grid">{FEATURES.map((feature) => <Card key={feature.category} className="feature-card"><div className="feature-icon"><EvidenceIcon kind={feature.icon} /></div><span className="feature-category">{feature.category}</span><h3>{feature.title}</h3><p>{feature.description}</p><div className="feature-detail">{feature.detail}</div></Card>)}</div><p className="feature-note">The interactive evidence above is fictional. Full research reports and method comparison remain part of the planned workspace.</p></section>;
}
