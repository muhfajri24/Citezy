import type { ResearchApi } from "./interface";
import { getResearchApi } from "./factory";
import { ResearchApiError } from "./errors";

/** Phase 3 is mock-only. Reject other modes explicitly; never call or fall back from a real backend. */
export function getDemoResearchApi(): ResearchApi {
    const mode = process.env.NEXT_PUBLIC_DATA_MODE ?? "mock";
    if (mode !== "mock") {
        throw new ResearchApiError("DEMO_MODE_REQUIRED", "This preview requires mock data mode.");
    }
    return getResearchApi();
}
