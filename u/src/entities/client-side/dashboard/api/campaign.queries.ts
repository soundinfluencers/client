import { useInfiniteQuery } from "@tanstack/react-query";
import { getCampaigns } from "./campaign.api";
import type { CampaignFilterStatus, CampaignListItem } from "../model/campaign.types";

export const PAGE_SIZE = 12;
export const REQUEST_LIMIT = PAGE_SIZE + 1;

type CampaignsPage = {
    items: CampaignListItem[];
    hasMore: boolean;
};

export const useInfiniteCampaignsQuery = (status: CampaignFilterStatus) => {
    return useInfiniteQuery({
        queryKey: ["dashboard-campaigns", status] as const,
        initialPageParam: 1,
        queryFn: async ({ pageParam }): Promise<CampaignsPage> => {
            const items = await getCampaigns({
                status,
                page: pageParam,
                limit: REQUEST_LIMIT,
            });

            return {
                items: items.slice(0, PAGE_SIZE),
                hasMore: items.length > PAGE_SIZE,
            };
        },
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.hasMore ? allPages.length + 1 : undefined;
        },
        staleTime: 15_000,
    });
};