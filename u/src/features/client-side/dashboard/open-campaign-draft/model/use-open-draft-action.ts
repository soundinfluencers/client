import React from "react";
import { useNavigate } from "react-router-dom";
import { hydrateCampaignBuilderFromDraft } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/hydrate-campaign-builder-from-draft";
import type { CampaignDraftDto } from "@/entities/client-side/campaign-draft/api/campaign-draft.dto";

const draftStepRouteMap = {
    addAccounts: "/client/create-campaign",
    addContent: "/client/create-campaign/content",
    strategyTable: "/client/create-campaign/content/strategy",
} as const;

type Params = {
    getDraftDetails: (draftId: string) => Promise<CampaignDraftDto>;
};

export const useOpenDraftAction = ({ getDraftDetails }: Params) => {
    const navigate = useNavigate();

    return React.useCallback(
        async (draftId: string) => {
            const draft = await getDraftDetails(draftId);

            hydrateCampaignBuilderFromDraft(draft);

            navigate(draftStepRouteMap[draft.step]);
        },
        [getDraftDetails, navigate],
    );
};