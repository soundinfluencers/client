import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type {AgencyCampaignTabId} from "@/entities/client-side/agency-campaign/model/agency-campaign.types.ts";

const TAB_VALUES = ["artist", "music", "event", "other"] as const;
const DEFAULT_TAB: AgencyCampaignTabId = "artist";

export const useAgencyCampaignTabParam = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const activeTab = useMemo<AgencyCampaignTabId>(() => {
        const value = searchParams.get("tab");
        if (!value) return DEFAULT_TAB;
        return TAB_VALUES.includes(value as AgencyCampaignTabId)
            ? (value as AgencyCampaignTabId)
            : DEFAULT_TAB;
    }, [searchParams]);

    const setActiveTab = (tab: AgencyCampaignTabId) => {
        const next = new URLSearchParams(searchParams);
        next.set("tab", tab);
        setSearchParams(next, { replace: true });
    };

    return {
        activeTab,
        setActiveTab,
    };
};