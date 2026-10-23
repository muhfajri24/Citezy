import Link from "next/link";
import { Alert, Badge, Button, Card, Input, Skeleton, Textarea } from "@/components/ui";
export default function Home() {
        return <>
            <header className="bg-landing px-6 py-6 text-white">
                <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
                    <Link href="/" aria-label="Citezy home" className="text-2xl font-bold tracking-tight">citezy<span className="text-lime">.</span>
                    </Link>
                    <span className="text-sm text-[#b9b9c5]">Frontend foundation / Phase 1-2</span>
                </div>
            </header>
            <main id="main" className="mx-auto max-w-5xl px-6 py-12 sm:py-20">
                <Badge>Foundation preview</Badge>
                <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">Don&apos;t just cite it.<br />Check it.</h1>
                <p className="mt-6 max-w-xl text-lg text-muted">An AI research workspace that shows the evidence behind each claim.</p>
                <Alert className="mt-8">Development preview. Research submission and the workbench are planned for later phases. No live research is performed here.</Alert>
                <section aria-labelledby="foundation" className="mt-10 grid gap-6 md:grid-cols-2">
                    <Card>
                        <h2 id="foundation" className="mb-5 text-xl font-semibold">Interface foundation</h2>
                        <label htmlFor="preview-title" className="mb-2 block text-sm font-medium">Preview title</label>
                        <Input id="preview-title" placeholder="A future research workspace"/>
                        <label htmlFor="preview-question" className="mb-2 mt-5 block text-sm font-medium">Research question preview</label>
                        <Textarea id="preview-question" placeholder="Research submission is available in a later phase." disabled/>
                        <Button className="mt-4" disabled>Research coming in Phase 3</Button>
                    </Card>
                    <Card>
                        <h2 className="text-xl font-semibold">Evidence language</h2>
                        <p className="mb-5 mt-2 text-sm text-muted">Status labels describe source support.</p>
                        <div className="flex flex-wrap gap-2">
                            <Badge className="text-success">Supported by excerpt</Badge>
                            <Badge className="text-warning">Partially supported</Badge>
                            <Badge className="text-danger">Unsupported</Badge>
                        </div>
                        <p className="my-6 text-sm">Source support is not independent fact-checking.</p>
                        <div className="space-y-3" aria-label="Static skeleton component preview">
                            <Skeleton />
                            <Skeleton className="w-3/4"/>
                        </div>
                    </Card>
                </section>
            </main>
        </>;
}
