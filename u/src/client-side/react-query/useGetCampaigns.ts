import { useInfiniteQuery } from "@tanstack/react-query";
import { getCampaigns } from "@/api/client/campaign/campaign.api";
import type {
    CampaignForList,
    CampaignStatusType,
} from "@/types/client/dashboard/campaign.types";
import { DASHBOARD_PAGE_SIZE } from "@/client-side/pages/client-dashboard/model/dashboard.constants.ts";

export const useGetCampaignsInfiniteQuery = ({
                                                 status,
                                             }: {
    status: CampaignStatusType | "all";
}) => {
    return useInfiniteQuery<
        CampaignForList[],                  // TQueryFnData
        Error,                              // TError
        CampaignForList[],                  // TData
        [string, CampaignStatusType | "all"], // TQueryKey
        number                              // TPageParam
    >({
        queryKey: ["getCampaigns", status],
        initialPageParam: 1,
        queryFn: async ({ pageParam }) => {
            return getCampaigns(status, pageParam, DASHBOARD_PAGE_SIZE);
        },
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < DASHBOARD_PAGE_SIZE) return undefined;
            return allPages.length + 1;
        },
        staleTime: 15_000,
    });
};