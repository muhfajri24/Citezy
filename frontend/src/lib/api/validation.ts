import type { ResearchRun, StartRunResponse } from "@/types/research";
import { ResearchApiError } from "./errors";
type Check = (value: unknown) => boolean;
const string: Check = (v) => typeof v === "string";
const nonempty: Check = (v) => typeof v === "string" && v.trim().length > 0;
const number: Check = (v) => typeof v === "number" && Number.isFinite(v);
const nonnegative: Check = (v) => number(v) && (v as number) >= 0;
const integer: Check = (v) => number(v) && Number.isInteger(v);
const timestamp: Check = (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}T.+Z$/.test(v) && Number.isFinite(Date.parse(v));
const url: Check = (v) => {
    if (typeof v !== "string")
        return false;
    try {
        const parsed = new URL(v);
        return ["https:", "http:"].includes(parsed.protocol) && !parsed.username && !parsed.password;
    }
    catch {
        return false;
    }
};
const array = (check: Check): Check => (v) => Array.isArray(v) && v.every(check);
const oneOf = (...options: string[]): Check => (v) => typeof v === "string" && options.includes(v);
const nullable = (check: Check): Check => (v) => v === null || check(v);
function object(v: unknown): v is Record<string, unknown> { return typeof v === "object" && v !== null && !Array.isArray(v); }
function shape(required: Record<string, Check>, optional: Record<string, Check> = {}): Check {
    return (v) => object(v) && Object.entries(required).every(([key, check]) => check(v[key])) && Object.entries(optional).every(([key, check]) => v[key] === undefined || check(v[key]));
}
const stages = oneOf("planning", "searching", "reading", "verifying", "synthesizing");
const status = oneOf("queued", "planning", "searching", "reading", "verifying", "synthesizing", "completed", "partial", "failed", "cancelled");
const step = shape({ stage: stages, status: oneOf("waiting", "running", "done", "failed") }, { detail: nullable(string), duration_ms: nullable(nonnegative) });
const source = shape({ id: nonempty, title: string, url }, { domain: nullable(string), authors: array(string), year: nullable(integer), fetched_at: nullable(timestamp), access_status: oneOf("accessible", "restricted", "unavailable", "unknown") });
const evidence = shape({ id: nonempty, source_id: nonempty, claim_id: nonempty, excerpt: string }, { explanation: nullable(string), match_offset: nullable((v) => integer(v) && nonnegative(v)) });
const claim = shape({ id: nonempty, text: string, assessment: oneOf("supported_by_excerpt", "partially_supported", "unsupported"), evidence_ids: array(nonempty) }, { explanation: nullable(string) });
const comparison = shape({ id: nonempty, method: string, claim_ids: array(nonempty) }, { dataset: nullable(string), metric: nullable(string), result: nullable((v) => string(v) || number(v)), units: nullable(string), limitation: nullable(string), comparability_warning: nullable(string) });
const report = shape({ summary: string, claims: array(claim), comparison: array(comparison) });
const run = shape({ id: nonempty, question: string, status, created_at: timestamp, steps: array(step), sources: array(source), evidence: array(evidence) }, { finished_at: nullable(timestamp), model_id: nullable(string), report: nullable(report), error_code: nullable(string), error_message: nullable(string) });
function invalid(): never { throw new ResearchApiError("INVALID_RESPONSE", "The research service returned an invalid response."); }
export function parseRun(value: unknown): ResearchRun { if (!run(value))
    invalid(); return value as ResearchRun; }
export function parseStartResponse(value: unknown): StartRunResponse {
    if (!shape({ id: nonempty, status: oneOf("queued", "planning") })(value))
        invalid();
    return value as StartRunResponse;
}
