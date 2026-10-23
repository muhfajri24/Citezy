import type { ResearchApi } from "./interface";
import { ResearchApiError } from "./errors";
import { MockResearchApi } from "./mock-client";
import { HttpResearchApi } from "./real-client";
interface ApiConfig {
    mode?: string;
    baseUrl?: string;
}
export function createResearchApi(config: ApiConfig = {
    mode: process.env.NEXT_PUBLIC_DATA_MODE,
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
}): ResearchApi {
    const mode = config.mode ?? "mock";
    if (mode === "mock")
        return new MockResearchApi();
    if (mode === "real")
        return new HttpResearchApi(config.baseUrl ?? "");
    throw new ResearchApiError("CONFIGURATION_ERROR", "NEXT_PUBLIC_DATA_MODE must be mock or real.");
}
let instance: ResearchApi | undefined;
/** Shared instance preserves in-memory mock runs across client route navigation. */
export function getResearchApi(): ResearchApi { return instance ??= createResearchApi(); }
