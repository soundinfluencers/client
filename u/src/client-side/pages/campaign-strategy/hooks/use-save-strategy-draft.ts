import React from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { postCampaignDraft } from "@/api/client/campaign/draft.api";
import { useCampaignStore } from "@/client-side/store";
import { saveCampaignDraftByStep } from "@/client-side/utils/draft.helpers";
import { CampaignDraftLatestStep } from "@/client-side/types/draft.types";
import {
    CLIENT_HOME_ROUTE,
} from "../model/campaign-strategy.constants.ts";

export const useSaveStrategyDraft = () => {
    const navigate = useNavigate();
    const resetCampaign = useCampaignStore((state) => state.actions.resetCampaign);

    return React.useCallback(async () => {
        try {
            const freshState = useCampaignStore.getState();

            await saveCampaignDraftByStep({
                step: CampaignDraftLatestStep.strategyTable,
                state: freshState,
                actions: freshState.actions,
                campaignName: freshState.campaignName || "Draft",
                navigate,
                postCampaignDraft,
            });

            toast.success("Draft saved successfully!");
            navigate(CLIENT_HOME_ROUTE);
            resetCampaign();
        } catch (error: any) {
            toast.error(error?.message || "Failed to save draft");
        }
    }, [navigate, resetCampaign]);
};