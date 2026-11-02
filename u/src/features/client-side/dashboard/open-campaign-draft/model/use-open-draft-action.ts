import React from "react";
import { toast } from "react-toastify";
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
    const generation = React.useRef(0);
    React.useEffect(() => () => { generation.current += 1; }, []);

    return React.useCallback(
        async (draftId: string) => {
            const request = ++generation.current;
            try {
            const draft = await getDraftDetails(draftId);
            if (request !== generation.current) return;

            hydrateCampaignBuilderFromDraft(draft);
            if (draft.selectedOffer?.isAvailable === false) {
                toast.warning("The saved offer is unavailable or has changed. Please review the selection before checkout.");
            }

            navigate(`${draftStepRouteMap[draft.step]}?${new URLSearchParams({ currency: draft.displayCurrency ?? "EUR",
                ...(draft.selectedOffer?.socialMedia ? { platform: draft.selectedOffer.socialMedia } : {}),
                ...(draft.selectedOffer?.genre ? { genre: draft.selectedOffer.genre } : {}),
            })}`);
            } catch (error) {
                if (request !== generation.current) return;
                toast.error(error instanceof Error ? error.message : "Failed to open draft. Please try again.");
            }
        },
        [getDraftDetails, navigate],
    );
};
