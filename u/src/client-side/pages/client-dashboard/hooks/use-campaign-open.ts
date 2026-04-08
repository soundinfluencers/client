import React from "react";
import { useNavigate } from "react-router-dom";
import type { CampaignStatusType } from "@/types/client/dashboard/campaign.types";
import {useOpenDraftAction} from "./use-open-draft-action.ts";
import {getCampaignDraft} from "@/api/client/campaign/draft.api.ts";

 const useCampaignOpen = () => {
    const navigate = useNavigate();

    return React.useCallback((id: string, status: CampaignStatusType) => {
        sessionStorage.setItem(
            "lastCampaign",
            JSON.stringify({ id, status, optionIndex: 0 }),
        );

        navigate("/client/campaign");
    }, [navigate]);
};
export const useDashboardCampaignOpen = () => {
    const openCampaign = useCampaignOpen();
    const openDraft = useOpenDraftAction({
        getDraftDetails: getCampaignDraft,
    });

    return async (id: string, status: CampaignStatusType) => {
        if (status === "draft") {
            await openDraft(id);
            return;
        }

        openCampaign(id, status);
    };
};