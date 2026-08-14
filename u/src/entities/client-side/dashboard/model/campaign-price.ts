import {
    formatPersistedCampaignCurrency,
} from "../../../../shared/functions/formatCurrency.ts";

export const formatDashboardCampaignPrice = ({
    price,
    displayCurrency,
}: {
    price: number;
    displayCurrency: unknown;
}): string => {
    if (!price) return "";

    return formatPersistedCampaignCurrency(price, displayCurrency);
};
