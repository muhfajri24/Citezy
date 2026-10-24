import { ResearchWorkspace } from "@/components/research/workspace";
export default async function ResearchRequestPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <ResearchWorkspace key={id} id={id} />;
}
