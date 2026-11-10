import type { ResearchRun } from "@/types/research";

const escapeMd = (value: string) => value.replace(/[\\`*_{}[\]<>]/g, "\\$&");
const csvCell = (value: unknown) => {
    const text = value == null ? "Not reported" : String(value);
    // Spreadsheet applications interpret these prefixes even inside quoted cells.
    const safe = /^[\s]*[=+@-]/.test(text) ? "'" + text : text;
    return '"' + safe.replaceAll('"', '""') + '"';
};
export function exportComparisonCsv(run: ResearchRun, demo: boolean): string {
    const rows: unknown[][] = [["Mode", "Run status", "Method", "Dataset", "Metric", "Result", "Units", "Limitation", "Comparability warning", "Claim IDs"]];
    for (const row of run.report?.comparison ?? []) rows.push([
        demo ? "DEMO ONLY / fictional" : "Backend research / inspect evidence", run.status,
        row.method, row.dataset, row.metric, row.result, row.units, row.limitation,
        row.comparability_warning, row.claim_ids.join("; "),
    ]);
    return rows.map(row => row.map(csvCell).join(",")).join("\r\n") + "\r\n";
}
export function exportReportMarkdown(run: ResearchRun, demo: boolean): string {
    const lines = ["# Citezy research report", "", demo ? "DEMO ONLY: fictional output, no live research." : "Backend research output. Inspect source evidence and limitations.",
        "", `Status: ${run.status}`, `Run: ${escapeMd(run.id)}`, "", `Question: ${escapeMd(run.question)}`, "",
        "Source support is not independent fact-checking.", "", "## Summary", "", escapeMd(run.report?.summary ?? "No report returned."), "", "## Claims and evidence", ""];
    for (const claim of run.report?.claims ?? []) {
        lines.push(`### ${escapeMd(claim.id)} — ${claim.assessment}`, "", escapeMd(claim.text), "", escapeMd(claim.explanation ?? "Explanation not reported."), "");
        for (const id of [...new Set(claim.evidence_ids)]) {
            const matches = run.evidence.filter(e => e.id === id && e.claim_id === claim.id);
            const evidence = matches.length === 1 ? matches[0] : undefined;
            const sources = evidence ? run.sources.filter(s => s.id === evidence.source_id) : [];
            if (!evidence || sources.length !== 1) { lines.push(`Evidence ${escapeMd(id)} unavailable.`, ""); continue; }
            const source = sources[0];
            lines.push(`Evidence ${escapeMd(id)} from ${escapeMd(source.title)} (${escapeMd(source.id)}):`, "",
                ...evidence.excerpt.split("\n").map(line => "> " + escapeMd(line)), "", `Source URL: ${escapeMd(source.url)}`, "");
        }
    }
    lines.push("## Comparison", "", "Unknown values are not reported. Cross-source evaluation conditions may differ.", "");
    for (const row of run.report?.comparison ?? []) lines.push(`### ${escapeMd(row.method)}`, "",
        ...["dataset", "metric", "result", "units", "limitation", "comparability_warning"].map(key => `${key}: ${escapeMd(String(row[key as keyof typeof row] ?? "Not reported"))}`),
        `Claims: ${row.claim_ids.map(escapeMd).join(", ")}`, "");
    return lines.join("\n") + "\n";
}
export function downloadReport(run: ResearchRun, format: "md" | "csv", demo: boolean) {
    const data = format === "md" ? exportReportMarkdown(run, demo) : exportComparisonCsv(run, demo);
    const blob = new Blob([data], {type: format === "md" ? "text/markdown;charset=utf-8" : "text/csv;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = `citezy-${run.id.replace(/[^a-zA-Z0-9_-]/g,"_")}.${format}`;
    anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
