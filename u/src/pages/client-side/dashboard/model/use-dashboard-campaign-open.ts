import React from "react";
import { useNavigate } from "react-router-dom";
import { useOpenDraftAction } from "@/features/client-side/dashboard/open-campaign-draft/model/use-open-draft-action";
import type { CampaignStatus } from "@/entities/client-side/dashboard/model/campaign.types";
import { getCampaignDraft } from "@/entities/client-side/campaign-draft/api/campaign-draft.api.ts";
import {
    useBundleByIdFetcher,
} from "@/entities/client-side/campaign-creator-page/bundle";
import {
    getPublishedOfferById,
} from "@/entities/client-side/campaign-creator-page/offer/api/offer.api";
import {
    useFetchCampaign,
    useProposalAccountsStore,
    useUpdateCampaign,
} from "@/client-side/store";

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
    const getBundleDetails = useBundleByIdFetcher();

    const openDraft = useOpenDraftAction({
        getDraftDetails: getCampaignDraft,
        getBundleDetails,
        getOfferDetails: getPublishedOfferById,
    });

    return async (id: string, status: CampaignStatus) => {
        if (status === "draft") {
            await openDraft(id);
            return;
        }

        if (status === "proposal") {
            useUpdateCampaign.getState().reset();
            useProposalAccountsStore.getState().clearAll();
            useFetchCampaign.setState({ data: null });
        }

        openCampaign(id, status);
    };
};
