import type {
    SelectedBundleSnapshot,
    SelectedCampaignAccount,
} from "./campaign-builder.types";
import type {
    CampaignCurrencyCode,
} from "@/entities/client-side/campaign-creator-page/campaign-filter/model/campaign-filter.types";
import {
    calculateCampaignSelectionTotal,
} from "./campaign-builder-selection";

export const calcBuilderTotal = ({
                                     selectedOfferId,
                                     selectedOfferPrice,
                                     selectedAccounts,
                                     selectedBundles,
                                     selectedOfferAccountIds,
                                     currency,
                                 }: {
    selectedOfferId: string | null;
    selectedOfferPrice?: number;
    selectedAccounts: SelectedCampaignAccount[];
    selectedBundles: SelectedBundleSnapshot[];
    selectedOfferAccountIds: string[];
    currency: CampaignCurrencyCode;
}) => {
    const offerPrice = selectedOfferId &&
        typeof selectedOfferPrice === "number"
        ? selectedOfferPrice
        : 0;

    return calculateCampaignSelectionTotal({
        offerPrice,
        selectedAccounts,
        selectedBundles,
        selectedOfferAccountIds,
        currency,
    });
};
