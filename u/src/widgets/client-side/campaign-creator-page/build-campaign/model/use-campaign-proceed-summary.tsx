import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";

import {
    useCampaignBuilderStore,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store";

import {
    type BuildCampaignOffer,
    calcBuilderTotal,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/calc-builder-total";

import {
    useBuildCampaignParams,
} from "@/features/client-side/campaign-creator-page/build-campaign-filters/model/use-build-campaign-params";
import { buildCampaignDraftPayload } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/build-draft-payload";
import {
    getCampaignDraft,
    updateCampaignDraft,
} from "@/entities/client-side/campaign-draft/api/campaign-draft.api";
import { CampaignDraftLatestStep } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.types";

type Params = {
    mode?: "create" | "add-influencer" | "ai-add-pages";
    optionIndex?: number | null;
    returnTo?: string | null;
};

export const useCampaignProceedSummary = ({
                                              mode = "create",
                                              optionIndex = null,
                                              returnTo = null,
                                          }: Params) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isSaving, setIsSaving] = useState(false);

    const { selectedCurrency } = useBuildCampaignParams();

    const selectedOfferId = useCampaignBuilderStore((s) => s.selectedOfferId);
    const selectedPromoCardIds = useCampaignBuilderStore(
        (s) => s.selectedPromoCardIds,
    );
    const selectedAccounts = useCampaignBuilderStore((s) => s.selectedAccounts);

    const setTotalPrice = useCampaignBuilderStore(
        (s) => s.actions.setTotalPrice,
    );

    const setSelectedCurrency = useCampaignBuilderStore(
        (s) => s.actions.setSelectedCurrency,
    );

    const isAddInfluencerMode = mode === "add-influencer" && optionIndex !== null;
    const isAiAddPagesMode = mode === "ai-add-pages";

    const offersQueries = queryClient.getQueriesData({
        queryKey: ["publishedOffers"],
    });

    const cachedOffers = offersQueries.flatMap(([, data]) =>
        Array.isArray(data) ? data : [],
    ) as BuildCampaignOffer[];

    const totalPrice = calcBuilderTotal({
        selectedOfferId: isAddInfluencerMode ? null : selectedOfferId,
        offers: isAddInfluencerMode ? [] : cachedOffers,
        selectedAccounts,
    });

    const canProceed = isAddInfluencerMode || isAiAddPagesMode
        ? selectedPromoCardIds.length >= 1
        : Boolean(selectedOfferId || selectedPromoCardIds.length >= 1);

    const handleProceed = async () => {
        if (!canProceed || isSaving) return;

        const currencySymbol = selectedCurrency?.key ?? "€";

        setTotalPrice(totalPrice);
        setSelectedCurrency(currencySymbol);

        if (isAiAddPagesMode) {
            const state = useCampaignBuilderStore.getState();
            if (!state.draftId) return;

            const step = state.campaignContent.length > 0
                ? CampaignDraftLatestStep.addContent
                : CampaignDraftLatestStep.addAccounts;

            setIsSaving(true);
            try {
                const latestDraft = await getCampaignDraft(state.draftId);
                const payload = buildCampaignDraftPayload(state, step);
                const selectedPayloadAccounts = payload.addedAccounts as Array<{
                    socialAccountId: string;
                }>;
                const selectedIds = new Set(
                    selectedPayloadAccounts.map((account) => String(account.socialAccountId)),
                );
                const excludedAccounts = (latestDraft.addedAccounts ?? [])
                    .filter((account) => !selectedIds.has(String(account.socialAccountId)))
                    .map((account) => ({
                        influencerId: account.influencerId,
                        socialAccountId: account.socialAccountId,
                        socialMedia: account.socialMedia,
                        isSelected: false,
                        dateRequest: account.dateRequest ?? "ASAP",
                        ...(account.selectedContent ?? account.selectedCampaignContentItem
                            ? {
                                selectedContent:
                                    account.selectedContent ??
                                    account.selectedCampaignContentItem,
                            }
                            : {}),
                    }));

                const updatedDraft = await updateCampaignDraft({
                    ...payload,
                    revision: Number(latestDraft.revision ?? 0),
                    addedAccounts: [...selectedPayloadAccounts, ...excludedAccounts],
                    ...(latestDraft.noContentAvailable !== undefined
                        ? { noContentAvailable: latestDraft.noContentAvailable }
                        : {}),
                    ...(latestDraft.source ? { source: latestDraft.source } : {}),
                });
                useCampaignBuilderStore.getState().actions.setDraftMeta({
                    draftId: state.draftId,
                    draftStep: step,
                    draftRevision: updatedDraft.revision,
                });
                await queryClient.invalidateQueries({ queryKey: ["campaign-draft", state.draftId] });
                navigate(returnTo?.startsWith("/") ? returnTo : "/ai-chat");
            } catch {
                toast.error("Could not update the campaign pages. Please try again.");
            } finally {
                setIsSaving(false);
            }
            return;
        }

        if (isAddInfluencerMode) {
            navigate(
                `/client/create-campaign/content?mode=add-influencer&option=${optionIndex}`,
            );
            return;
        }

        navigate("/client/create-campaign/content");
    };

    return {
        isAddInfluencerMode,
        isAiAddPagesMode,
        isSaving,
        selectedCurrency,
        selectedOfferId,
        selectedPromoCardIds,
        selectedAccounts,
        totalPrice,
        canProceed,
        handleProceed,
    };
};
