import { Skeleton } from "@/components/ui";
export default function LoadingResearchWorkspace() {
    return <main id="main" className="route-loading" aria-busy="true" aria-labelledby="loading-title"><p className="workspace-eyebrow">CITEZY / RESEARCH WORKSPACE</p><h1 id="loading-title">Opening your workspace.</h1><p role="status">Loading the interface. Research status will appear when the run is loaded.</p><div className="route-loading-tabs"><Skeleton /><Skeleton /><Skeleton /></div><Skeleton className="route-loading-body" /></main>;
}
