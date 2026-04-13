
import React from "react";
import { useNavigate } from "react-router-dom";
import { draftStepRouteMap } from "../model/draft-step-routes";
import { hydrateCampaignStoreFromDraft } from "../model/dashboard.helpers";
import type { DraftDetailsResponse } from "../types/draft-open.types";
import { CampaignDraftLatestStep } from "@/client-side/types/draft.types";
import {useCampaignStore} from "@/client-side/store";

type Params = {
    getDraftDetails: (draftId: string) => Promise<DraftDetailsResponse>;
};

export const useOpenDraftAction = ({ getDraftDetails }: Params) => {
    const navigate = useNavigate();
    const setDraftId = useCampaignStore((s) => s.actions.setDraftId);
    return React.useCallback(
        async (draftId: string) => {
            const data = await getDraftDetails(draftId);

            hydrateCampaignStoreFromDraft(data);

            if (data.step === CampaignDraftLatestStep.strategyTable) {
                sessionStorage.setItem(
                    "lastCampaign",
                    JSON.stringify({
                        id: data._id,
                        status: "draft",
                        optionIndex: 0,
                    }),
                );

                navigate("/client/campaign");
                return;
            } else {
                setDraftId(data._id ?? draftId);
            }

            navigate(draftStepRouteMap[data.step]);
        },
        [getDraftDetails, navigate],
    );
};