import { useQuery } from "@tanstack/react-query";
import type { CampaignFiltersRequestBody } from "../model/campaign-filter.types";
import { getCampaignFilters } from "./campaign-filter.api";

export const useCampaignFiltersQuery = (
    body: CampaignFiltersRequestBody,
) => {
    return useQuery({
        queryKey: ["campaign-filters", body] as const,
        queryFn: () => getCampaignFilters(body),
        staleTime: 60_000,
    });
};