import type { CampaignContentItem } from "@/client-side/types/content";
import type { StrategyContentGroups } from "../types/campaign-strategy.types";

export const groupCampaignContent = (
    campaignContent: CampaignContentItem[],
): StrategyContentGroups => {
    console.log(campaignContent,'campaignContent');
    return {
        main: campaignContent.filter((item) => item.socialMediaGroup === "main"),
        music: campaignContent.filter((item) => item.socialMediaGroup === "music"),
        press: campaignContent.filter((item) => item.socialMediaGroup === "press"),
    };
};

export const buildPromoShareUrl = (
    campaignId: string,
    origin: string,
) => {
    const id = encodeURIComponent(campaignId);
    return `${origin}/promo-share/${id}/proposal`;
};
export const getCampaignSelectedAccounts = (
    campaign: any,
    state: any,
) => {
    if (campaign?.kind === "proposal") {
        return campaign?.selectedOption?.addedAccounts ?? [];
    }

    if (campaign?.kind === "draft") {
        return campaign?.addedAccounts ?? [];
    }

    if (campaign?.addedAccounts?.length) {
        return campaign.addedAccounts;
    }

    const map = new Map<string, any>();

    const offerAccounts = state.offer?.connectedAccounts ?? [];
    const promoAccounts = state.promoCard ?? [];

    [...offerAccounts, ...promoAccounts].forEach((account: any) => {
        const key =
            account.accountId ||
            account.socialAccountId ||
            account._id;

        if (!key) return;

        if (!map.has(key)) {
            map.set(key, account);
        }
    });

    return Array.from(map.values());
};