import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { currencySymbol } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/selected-offer";
import { proposalAddUrl } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/proposal-add-influencer-builder";

import {
    useCampaignBuilderStore,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store";

import {
    calcBuilderTotal,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/calc-builder-total";

import {
    useBuildCampaignParams,
} from "@/features/client-side/campaign-creator-page/build-campaign-filters/model/use-build-campaign-params";
import { buildCampaignDraftPayload } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/build-draft-payload";
import {
    getCampaignDraft,
    updateAiCampaignDraft,
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

    const { selectedCurrency: queryCurrency } = useBuildCampaignParams();
    const addSession = useCampaignBuilderStore((s) => s.proposalAddSession);
    const selectedCurrency = mode === 'add-influencer' && addSession ? { currency: addSession.currency, key: currencySymbol(addSession.currency) } : queryCurrency;

    const selectedOfferId = useCampaignBuilderStore((s) => s.selectedOfferId);
    const offerPrices = useCampaignBuilderStore((s) => s.selectedOfferPrices);
    const offerAvailable = useCampaignBuilderStore((s) => s.selectedOfferIsAvailable);
    const membership = useCampaignBuilderStore((s) => s.selectedOfferAccountIds);
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
    useEffect(() => {
        setSelectedCurrency(selectedCurrency?.key ?? "€");
    }, [selectedCurrency?.key, setSelectedCurrency]);

    const isAddInfluencerMode = mode === "add-influencer" && optionIndex !== null;
    const isAiAddPagesMode = mode === "ai-add-pages";

    const totalPrice = calcBuilderTotal({
        selectedOfferId,
        selectedAccounts,
        selectedOfferPrices: offerPrices,
        selectedOfferAccountIds: membership,
        selectedCurrency: selectedCurrency?.key ?? "€",
    });
    const unsupportedBundles = useCampaignBuilderStore((s) => s.unsupportedDraftBundles);
    const totalPriceReady = Number.isSafeInteger(totalPrice) && totalPrice >= 0 && !unsupportedBundles;

    const builderReady = useCampaignBuilderStore((s) => s.totalPriceReady);
    const canProceed = Boolean(selectedOfferId || selectedPromoCardIds.length >= 1) && offerAvailable !== false && totalPriceReady &&
        (!isAddInfluencerMode || Boolean(addSession && !addSession.completed && addSession.optionIndex === optionIndex && builderReady));

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
                    selectionId: string;
                }>;
                const selectedIds = new Set(
                    selectedPayloadAccounts.map((account) => account.selectionId),
                );
                const excludedAccounts = (latestDraft.addedAccounts ?? [])
                    .filter((account) => !selectedIds.has(account.selectionId))
                    .map((account) => ({
                        selectionId: account.selectionId,
                        source: account.source,
                        ...(account.offerId ? { offerId: account.offerId } : {}),
                        ...(account.bundleId ? { bundleId: account.bundleId } : {}),
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

                const updatedDraft = await updateAiCampaignDraft({
                    ...payload,
                    revision: state.draftRevision,
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
            if (addSession) {
                const params = new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search);
                if (params.get('session') === addSession.sessionId && params.get('campaignId') === addSession.campaignId) {
                    params.set('currency', addSession.currency); navigate('/client/create-campaign/content?' + params);
                } else navigate(proposalAddUrl(addSession, addSession.currency, '/client/create-campaign/content', useCampaignBuilderStore.getState().offerCatalogContext));
            }
            return;
        }

        const params = new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search);
        if (params.get('mode') === 'proposal-option-create') { params.set('currency', selectedCurrency.currency); navigate('/client/create-campaign/content?' + params); return; }
        navigate(`/client/create-campaign/content?currency=${selectedCurrency.currency}`);
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
        totalPriceReady,
        canProceed,
        handleProceed,
    };
};
