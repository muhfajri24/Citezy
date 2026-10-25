import type { ResearchApi } from "./interface";
import { getResearchApi } from "./factory";

/** Provides research API instance (supporting both mock and real backend). */
export function getDemoResearchApi(): ResearchApi {
    return getResearchApi();
}
