import type {
    SelectedCampaignAccount,
} from "./campaign-builder.types";

export type BuildCampaignOffer = {
    id: string;
    price: number;
};

const getAccountPrice = (account?: SelectedCampaignAccount | null) => {
    if (!account) return 0;
    return typeof account.price === "number" ? account.price : 0;
};

export const calcBuilderTotal = ({
                                     selectedOfferId,
                                     offers,
                                     selectedAccounts,
                                 }: {
    selectedOfferId: string | null;
    offers: BuildCampaignOffer[];
    selectedAccounts: SelectedCampaignAccount[];
}) => {
    const selectedOffer =
        offers.find((item) => item.id === selectedOfferId) ?? null;

    const offerPrice = selectedOffer?.price ?? 0;

    const accountsPrice = selectedAccounts.reduce((sum, account) => {
        return sum + getAccountPrice(account);
    }, 0);

    return offerPrice + accountsPrice;
};