import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { getEnumSearchParam } from "@/shared/lib/url/search-params";
import type { CampaignViewMode } from "./types";

const VIEW_VALUES = ["table", "grid"] as const;
const DEFAULT_VIEW: CampaignViewMode = "grid";

export const useCampaignViewParam = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const view = useMemo<CampaignViewMode>(() => {
        return getEnumSearchParam(
            searchParams.get("view"),
            VIEW_VALUES,
            DEFAULT_VIEW,
        );
    }, [searchParams]);

    const setView = (nextView: CampaignViewMode) => {
        const next = new URLSearchParams(searchParams);
        next.set("view", nextView);
        setSearchParams(next, { replace: true });
    };

    return {
        view,
        setView,
    };
};