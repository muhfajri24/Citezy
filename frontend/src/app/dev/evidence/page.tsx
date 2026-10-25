import { notFound } from "next/navigation";
import { EvidenceQaScenario } from "@/components/evidence/qa-scenario";
export default function EvidenceQaPage() {
    if (process.env.NODE_ENV !== "development") notFound();
    return <EvidenceQaScenario />;
}
