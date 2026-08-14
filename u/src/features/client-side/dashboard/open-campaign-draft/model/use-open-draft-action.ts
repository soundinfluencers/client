import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
    CampaignDraftHydrationError,
    hydrateCampaignBuilderFromDraft,
    validateCampaignDraftForHydration,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/hydrate-campaign-builder-from-draft";
import type { CampaignDraftGetDto } from "@/entities/client-side/campaign-draft/api/campaign-draft.dto";
import { parseCampaignDraftError } from "@/entities/client-side/campaign-draft/model/campaign-draft.errors";
import type {
    Bundle,
} from "@/entities/client-side/campaign-creator-page/bundle";
import type {
    PublishedOffer,
} from "@/entities/client-side/campaign-creator-page/offer/model/offer.types";

const draftStepRouteMap = {
    addAccounts: "/client/create-campaign",
    addContent: "/client/create-campaign/content",
    strategyTable: "/client/create-campaign/content/strategy",
} as const;

type Params = {
    getDraftDetails: (draftId: string) => Promise<CampaignDraftGetDto>;
    getBundleDetails: (bundleId: string) => Promise<Bundle>;
    getOfferDetails: (
        offerId: string,
        platform: string,
        genre: string,
    ) => Promise<PublishedOffer>;
};

export const useOpenDraftAction = ({
    getDraftDetails,
    getBundleDetails,
    getOfferDetails,
}: Params) => {
    const navigate = useNavigate();

    return React.useCallback(
        async (draftId: string) => {
            try {
                const draft = await getDraftDetails(draftId);

                validateCampaignDraftForHydration(draft);

                const bundleIds = [
                    ...new Set(
                        draft.addedBundles.map((bundle) => bundle.bundleId),
                    ),
                ];
                let bundles: Bundle[];

                try {
                    bundles = await Promise.all(
                        bundleIds.map(getBundleDetails),
                    );
                } catch (error) {
                    throw new CampaignDraftHydrationError(
                        "draft_bundle_enrichment_failed",
                        {
                            bundleIds,
                            cause:
                                error instanceof Error
                                    ? error.message
                                    : String(error),
                        },
                    );
                }

                let offerMetadata: PublishedOffer | undefined;

                if (draft.selectedOffer) {
                    try {
                        offerMetadata = await getOfferDetails(
                            draft.selectedOffer.offerId,
                            draft.selectedOffer.socialMedia,
                            draft.selectedOffer.genre,
                        );
                    } catch (error) {
                        throw new CampaignDraftHydrationError(
                            "draft_offer_enrichment_failed",
                            {
                                offerId: draft.selectedOffer.offerId,
                                cause:
                                    error instanceof Error
                                        ? error.message
                                        : String(error),
                            },
                        );
                    }
                }

                hydrateCampaignBuilderFromDraft(draft, {
                    bundleMetadataById: new Map(
                        bundles.map((bundle) => [bundle.bundleId, bundle]),
                    ),
                    offerMetadata,
                });

                navigate(draftStepRouteMap[draft.step]);
            } catch (error) {
                if (import.meta.env.DEV) {
                    console.error(
                        error instanceof CampaignDraftHydrationError
                            ? "[Campaign Draft v2 hydration failed]"
                            : "[Campaign Draft v2 open failed]",
                        error,
                    );
                }

                toast.error(
                    parseCampaignDraftError(
                        error,
                        "Failed to open draft",
                    ).message,
                );
            }
        },
        [
            getBundleDetails,
            getDraftDetails,
            getOfferDetails,
            navigate,
        ],
    );
};
