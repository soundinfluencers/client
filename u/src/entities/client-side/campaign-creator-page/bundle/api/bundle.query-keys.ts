import type {
    GetFilteredBundlesRequest,
} from "./bundle.dto";

export const bundleQueryKeys = {
    all: ["campaign-creator-bundle"] as const,
    filtered: (request: GetFilteredBundlesRequest) =>
        [...bundleQueryKeys.all, "filtered", request] as const,
    detail: (bundleId: string) =>
        [...bundleQueryKeys.all, "detail", bundleId] as const,
};
