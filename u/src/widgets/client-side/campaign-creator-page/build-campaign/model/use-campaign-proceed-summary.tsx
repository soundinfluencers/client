import { useNavigate } from "react-router-dom";
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

type Params = {
    mode?: "create" | "add-influencer";
    optionIndex?: number | null;
};

export const useCampaignProceedSummary = ({
                                              mode = "create",
                                              optionIndex = null,
                                          }: Params) => {
    const navigate = useNavigate();

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

    const handleProceed = () => {
        if (!canProceed) return;

        const currencySymbol = selectedCurrency?.key ?? "€";

        setTotalPrice(totalPrice);
        setSelectedCurrency(currencySymbol);

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
