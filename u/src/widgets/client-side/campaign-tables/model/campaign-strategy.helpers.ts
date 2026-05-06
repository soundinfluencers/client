import type {
    CampaignContentDescription,
    CampaignContentItem,
    SelectedCampaignAccount,
    SelectedCampaignContentRef,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.types";
import type {
    MainProfileGroup,
    StrategyCampaign,
    StrategyGroup,
    StrategyGroupedResult,
    StrategyRow,
} from "./campaign-strategy.types";

const MAIN_SOCIALS = ["instagram", "tiktok", "youtube", "facebook"] as const;
const MUSIC_SOCIALS = ["spotify", "soundcloud"] as const;

export const normalizeSocial = (value: string) => String(value || "").toLowerCase();

export const createObjectId = () => {
    const bytes = new Uint8Array(12);

    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
        crypto.getRandomValues(bytes);
    } else {
        for (let i = 0; i < 12; i += 1) {
            bytes[i] = Math.floor(Math.random() * 256);
        }
    }

    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
};

export const getAccountKey = (account: Pick<SelectedCampaignAccount, "accountId">) =>
    String(account.accountId ?? "");

export const isMainSocial = (socialMedia: string) =>
    MAIN_SOCIALS.includes(normalizeSocial(socialMedia) as (typeof MAIN_SOCIALS)[number]);

export const isMusicSocial = (socialMedia: string) =>
    MUSIC_SOCIALS.includes(normalizeSocial(socialMedia) as (typeof MUSIC_SOCIALS)[number]);

export const isPressSocial = (socialMedia: string) =>
    !isMainSocial(socialMedia) && !isMusicSocial(socialMedia);

export const getGroupBySocial = (socialMedia: string): StrategyGroup => {
    if (isMainSocial(socialMedia)) return "main";
    if (isMusicSocial(socialMedia)) return "music";
    return "press";
};

const isMainProfile = (value: unknown): value is MainProfileGroup =>
    value === "creator" || value === "community";

export const resolveCampaignSocialMedia = (
    accounts: SelectedCampaignAccount[],
    items: CampaignContentItem[],
): string => {
    const socials = Array.from(
        new Set(
            [
                ...accounts.map((item) => normalizeSocial(item.socialMedia)),
                ...items.map((item) => normalizeSocial(item.socialMedia)),
            ].filter(Boolean),
        ),
    );

    return socials.length > 1 ? "multipromo" : socials[0] ?? "instagram";
};

export const groupCampaignStrategyData = ({
                                              accounts,
                                              items,
                                          }: {
    accounts: SelectedCampaignAccount[];
    items: CampaignContentItem[];
}): StrategyGroupedResult => {
    const mainCreatorAccounts = accounts.filter(
        (account) =>
            isMainSocial(account.socialMedia) &&
            account.profileType === "creator",
    );

    const mainCommunityAccounts = accounts.filter(
        (account) =>
            isMainSocial(account.socialMedia) &&
            account.profileType === "community",
    );

    const musicAccounts = accounts.filter((account) =>
        isMusicSocial(account.socialMedia),
    );

    const pressAccounts = accounts.filter((account) =>
        isPressSocial(account.socialMedia),
    );

    const mainCreatorItems = items.filter(
        (item) =>
            item.socialMediaGroup === "main" &&
            isMainProfile(item.profileType) &&
            item.profileType === "creator",
    );

    const mainCommunityItems = items.filter(
        (item) =>
            item.socialMediaGroup === "main" &&
            isMainProfile(item.profileType) &&
            item.profileType === "community",
    );

    const musicItems = items.filter((item) => item.socialMediaGroup === "music");
    const pressItems = items.filter((item) => item.socialMediaGroup === "press");

    return {
        mainCreator: {
            title: "Video Distribution — Creators",
            accounts: mainCreatorAccounts,
            items: mainCreatorItems,
        },
        mainCommunity: {
            title: "Video Distribution — Communities",
            accounts: mainCommunityAccounts,
            items: mainCommunityItems,
        },
        music: {
            title: "Music Placements",
            accounts: musicAccounts,
            items: musicItems,
        },
        press: {
            title: "Press Coverage",
            accounts: pressAccounts,
            items: pressItems,
        },
    };
};

export const getPlatformItemsForAccount = ({
                                               account,
                                               items,
                                           }: {
    account: SelectedCampaignAccount;
    items: CampaignContentItem[];
}): CampaignContentItem[] => {
    const social = normalizeSocial(account.socialMedia);

    if (isMainSocial(social)) {
        const exactBySocialAndProfile = items.filter(
            (item) =>
                item.socialMediaGroup === "main" &&
                normalizeSocial(item.socialMedia) === social &&
                item.profileType === account.profileType,
        );

        if (exactBySocialAndProfile.length > 0) return exactBySocialAndProfile;

        const exactBySocial = items.filter(
            (item) =>
                item.socialMediaGroup === "main" &&
                normalizeSocial(item.socialMedia) === social,
        );

        if (exactBySocial.length > 0) return exactBySocial;
    }

    const exactBySocial = items.filter(
        (item) => normalizeSocial(item.socialMedia) === social,
    );

    if (exactBySocial.length > 0) return exactBySocial;

    return items.filter(
        (item) => item.socialMediaGroup === getGroupBySocial(social),
    );
};

export const buildStrategyRows = ({
                                      accounts,
                                      items,
                                      group,
                                  }: {
    accounts: SelectedCampaignAccount[];
    items: CampaignContentItem[];
    group: StrategyGroup;
}): StrategyRow[] => {
    return accounts.map((account) => {
        const platformItems = getPlatformItemsForAccount({ account, items });

        const selected = account.selectedCampaignContentItem ?? null;
        const selectedContentId = String(selected?.campaignContentItemId ?? "");
        const selectedDescriptionId = String(selected?.descriptionId ?? "");

        let selectedContentIndex = platformItems.findIndex(
            (item) => String(item._id) === selectedContentId,
        );

        if (selectedContentIndex < 0) selectedContentIndex = 0;

        const selectedItem = platformItems[selectedContentIndex] ?? null;
        const descriptions = selectedItem?.descriptions ?? [];

        let selectedDescriptionIndex = descriptions.findIndex(
            (description) => String(description._id) === selectedDescriptionId,
        );

        if (selectedDescriptionIndex < 0) selectedDescriptionIndex = 0;

        const selectedDescription = descriptions[selectedDescriptionIndex] ?? null;

        const rawDateRequest = String(account.dateRequest ?? "ASAP");
        const [dateMode, dateValue = ""] = rawDateRequest.split(":");

        return {
            accountKey: getAccountKey(account),
            account,
            group,
            platformItems,
            selectedItem,
            selectedDescription,
            selectedContentIndex,
            selectedDescriptionIndex,
            dateMode,
            dateValue,
        };
    });
};

export const cloneStrategyCampaign = (campaign: StrategyCampaign): StrategyCampaign =>
    structuredClone(campaign);

export const buildFallbackSelectedContent = (
    account: SelectedCampaignAccount,
    content: CampaignContentItem[],
): SelectedCampaignContentRef | null => {
    const fallbackItem = getPlatformItemsForAccount({
        account,
        items: content,
    })[0];

    const fallbackDescription = fallbackItem?.descriptions?.[0];

    if (!fallbackItem?._id || !fallbackDescription?._id) {
        return null;
    }

    return {
        campaignContentItemId: String(fallbackItem._id),
        descriptionId: String(fallbackDescription._id),
    };
};

export const normalizeDescriptions = (
    descriptions?: CampaignContentDescription[],
): CampaignContentDescription[] =>
    (descriptions ?? []).map((item) => ({
        _id: String(item._id || createObjectId()),
        description: String(item.description ?? ""),
    }));