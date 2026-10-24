import { SubmissionReceipt } from "@/components/landing/submission-receipt";
export default async function ResearchRequestPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <SubmissionReceipt key={id} id={id} />;
}
