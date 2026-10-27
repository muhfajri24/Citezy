import type { ResearchApi } from "./interface";
import { getResearchApi } from "./factory";
import { ResearchApiError } from "./errors";

/** Legacy demo-only callers must never issue live requests. Product routes use getResearchApi. */
export function getDemoResearchApi(): ResearchApi {
    if ((process.env.NEXT_PUBLIC_DATA_MODE ?? "mock") !== "mock")
        throw new ResearchApiError("DEMO_MODE_REQUIRED", "This demonstration requires mock data mode.");
    return getResearchApi();
}
