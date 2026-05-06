import React from "react";
import { useNavigate } from "react-router-dom";
import { useOpenDraftAction } from "@/features/client-side/dashboard/open-campaign-draft/model/use-open-draft-action";
import type { CampaignStatus } from "@/entities/client-side/dashboard/model/campaign.types";
import { getCampaignDraft } from "@/entities/client-side/campaign-draft/api/campaign-draft.api.ts";

const useCampaignOpen = () => {
    const navigate = useNavigate();

    return React.useCallback(
        (id: string, status: CampaignStatus) => {
            sessionStorage.setItem(
                "lastCampaign",
                JSON.stringify({ id, status, optionIndex: 0 }),
            );

            navigate("/client/campaign");
        },
        [navigate],
    );
};

export const useDashboardCampaignOpen = () => {
    const openCampaign = useCampaignOpen();

    const openDraft = useOpenDraftAction({
        getDraftDetails: getCampaignDraft,
    });

    return async (id: string, status: CampaignStatus) => {
        if (status === "draft") {
            await openDraft(id);
            return;
        }

        openCampaign(id, status);
    };
};