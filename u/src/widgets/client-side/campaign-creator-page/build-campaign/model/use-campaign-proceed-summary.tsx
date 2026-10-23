import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

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

    const { selectedCurrency } = useBuildCampaignParams();

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
        selectedOfferId: isAddInfluencerMode ? null : selectedOfferId,
        selectedAccounts,
        selectedOfferPrices: isAddInfluencerMode ? null : offerPrices,
        selectedOfferAccountIds: isAddInfluencerMode ? [] : membership,
        selectedCurrency: selectedCurrency?.key ?? "€",
    });
    const unsupportedBundles = useCampaignBuilderStore((s) => s.unsupportedDraftBundles);
    const totalPriceReady = Number.isSafeInteger(totalPrice) && totalPrice >= 0 && !unsupportedBundles;

    const canProceed = isAddInfluencerMode
        ? selectedPromoCardIds.length >= 1
        : Boolean(selectedOfferId || selectedPromoCardIds.length >= 1) && offerAvailable !== false && totalPriceReady;

    const handleProceed = () => {
        if (!canProceed) return;

        const currencySymbol = selectedCurrency?.key ?? "€";

        setTotalPrice(totalPrice);
        setSelectedCurrency(currencySymbol);

        if (isAddInfluencerMode) {
            navigate(
                `/client/create-campaign/content?mode=add-influencer&option=${optionIndex}`,
            );
            return;
        }

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
