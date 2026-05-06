import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { getEnumSearchParam } from "@/shared/lib/url/search-params";
import type { CampaignFilterStatus } from "@/entities/client-side/dashboard/model/campaign.types";
import { useCampaignViewParam } from "@/features/client-side/dashboard/switch-view/model/use-campaign-view-param";
import { useInfiniteCampaignsQuery } from "@/entities/client-side/dashboard/api/campaign.queries";

const STATUS_VALUES = [
    "all",
    "draft",
    "proposal",
    "under_review",
    "distributing",
    "closed",
] as const;

const DEFAULT_STATUS: CampaignFilterStatus = "all";

export const useDashboardCampaigns = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { view, setView } = useCampaignViewParam();

    const filterStatus = useMemo<CampaignFilterStatus>(() => {
        return getEnumSearchParam(
            searchParams.get("status"),
            STATUS_VALUES,
            DEFAULT_STATUS,
        );
    }, [searchParams]);

    const setStatus = (status: CampaignFilterStatus) => {
        const next = new URLSearchParams(searchParams);

        if (status === "all") {
            next.delete("status");
        } else {
            next.set("status", status);
        }

        setSearchParams(next, { replace: true });
    };

    const query = useInfiniteCampaignsQuery(filterStatus);

    const campaigns = useMemo(
        () => query.data?.pages.flatMap((page) => page.items) ?? [],
        [query.data],
    );

    return {
        view,
        setView,
        filterStatus,
        setStatus,
        campaigns,
        isError: query.isError,
        isLoading: query.isLoading,
        isFetchingNextPage: query.isFetchingNextPage,
        refetch: query.refetch,
        hasMore: query.isFetched && Boolean(query.hasNextPage),
        loadMore: () => query.fetchNextPage(),
    };
};