import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

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

type Params = {
    mode?: "create" | "add-influencer";
    optionIndex?: number | null;
};

export const useCampaignProceedSummary = ({
                                              mode = "create",
                                              optionIndex = null,
                                          }: Params) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

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

    const canProceed = isAddInfluencerMode
        ? selectedPromoCardIds.length >= 1
        : Boolean(selectedOfferId || selectedPromoCardIds.length >= 1);

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

        navigate("/client/create-campaign/content");
    };

    return {
        isAddInfluencerMode,
        selectedCurrency,
        selectedOfferId,
        selectedPromoCardIds,
        selectedAccounts,
        totalPrice,
        canProceed,
        handleProceed,
    };
};