import React from "react";

import type {
    CampaignFilterStatus,
} from "../model/dashboard.types";
import type {CampaignListViewMode} from "@/client-side/types/common.ts";
import {useGetCampaignsInfiniteQuery} from "@/client-side/react-query";

export const useDashboardCampaigns = () => {
    const [view, setView] = React.useState<CampaignListViewMode>("grid");
    const [filterStatus, setFilterStatus] =
        React.useState<CampaignFilterStatus>("all");

    const query = useGetCampaignsInfiniteQuery({ status: filterStatus });
    console.log("query", query);
    const campaigns = React.useMemo(() => {
        return query.data?.pages.flat() ?? [];
    }, [query.data]);

    const changeStatus = React.useCallback((next: CampaignFilterStatus) => {
        setFilterStatus(next);
    }, []);

    const loadMore = React.useCallback(() => {
        if (!query.hasNextPage || query.isFetchingNextPage) return;
        query.fetchNextPage();
    }, [query]);

    return {
        view,
        setView,
        filterStatus,
        setStatus: changeStatus,
        campaigns,
        loadMore,
        hasMore: query.hasNextPage ?? false,
        ...query,
    };
};