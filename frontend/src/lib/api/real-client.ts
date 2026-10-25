import type { ResearchRun, StartRunRequest, StartRunResponse } from "@/types/research";
import { inspectIntegrity, type IntegrityIssue } from "@/lib/utils/integrity";
import { ResearchApiError, httpError } from "./errors";
import type { ResearchApi } from "./interface";
import { parseRun, parseStartResponse } from "./validation";
export function validateBaseUrl(value: string): string {
    try {
        const url = new URL(value);
        if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash)
            throw new Error();
        return url.toString().replace(/\/$/, "");
    }
    catch {
        throw new ResearchApiError("CONFIGURATION_ERROR", "Real data mode requires a valid HTTP(S) API base URL without credentials, query or fragment.");
    }
}
interface HttpOptions {
    fetch?: typeof fetch;
    timeoutMs?: number;
    onIntegrityIssues?: (issues: IntegrityIssue[]) => void;
}
export class HttpResearchApi implements ResearchApi {
    private readonly baseUrl: string;
    private readonly fetcher: typeof fetch;
    private readonly timeoutMs: number;
    private readonly diagnose: (issues: IntegrityIssue[]) => void;
    constructor(baseUrl: string, options: HttpOptions = {}) {
        this.baseUrl = validateBaseUrl(baseUrl);
        this.fetcher = options.fetch ? options.fetch.bind(globalThis) : ((input, init) => fetch(input, init));
        this.timeoutMs = options.timeoutMs ?? 10000;
        if (!Number.isFinite(this.timeoutMs) || this.timeoutMs <= 0)
            throw new Error("Request timeout must be positive.");
        this.diagnose = options.onIntegrityIssues ?? ((issues) => console.warn("Research data contains unresolved references", issues.map(({ code }) => code)));
    }
    private async request(path: string, init: RequestInit, signal?: AbortSignal): Promise<unknown> {
        const controller = new AbortController();
        let timedOut = false;
        const abort = () => controller.abort(signal?.reason);
        if (signal?.aborted)
            abort();
        else
            signal?.addEventListener("abort", abort, { once: true });
        const timer = setTimeout(() => { timedOut = true; controller.abort(); }, this.timeoutMs);
        const targetUrl = `${this.baseUrl}${path}`;
        try {
            console.log(`[HttpResearchApi] Requesting: ${init.method || "GET"} ${targetUrl}`);
            const response = await this.fetcher(targetUrl, { ...init, signal: controller.signal });
            if (!response.ok)
                throw httpError(response.status);
            try {
                return await response.json();
            }
            catch (error) {
                if (controller.signal.aborted)
                    throw error;
                throw new ResearchApiError("INVALID_JSON", "The research service returned unreadable data.");
            }
        }
        catch (error) {
            console.error(`[HttpResearchApi] Failed calling ${targetUrl}:`, error);
            if (error instanceof ResearchApiError)
                throw error;
            if (timedOut)
                throw new ResearchApiError("TIMEOUT", "The research request timed out. Please try again.", undefined, true);
            if (signal?.aborted)
                throw new ResearchApiError("ABORTED", "The research request was cancelled.");
            throw new ResearchApiError("NETWORK_ERROR", "Cannot reach the research service. Please check your connection.", undefined, true);
        }
        finally {
            clearTimeout(timer);
            signal?.removeEventListener("abort", abort);
        }
    }
    async startRun(request: StartRunRequest): Promise<StartRunResponse> {
        return parseStartResponse(await this.request("/api/runs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(request) }));
    }
    async getRun(id: string, signal?: AbortSignal): Promise<ResearchRun> {
        if (!id.trim() || id === "." || id === "..")
            throw new ResearchApiError("NOT_FOUND", "A valid research run ID is required.", 404);
        const run = parseRun(await this.request(`/api/runs/${encodeURIComponent(id)}`, { method: "GET", cache: "no-store" }, signal));
        if (run.id !== id)
            throw new ResearchApiError("INVALID_RESPONSE", "The research service returned a different run.");
        const issues = inspectIntegrity(run);
        if (issues.length)
            this.diagnose(issues);
        return run;
    }
}
