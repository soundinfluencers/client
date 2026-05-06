import type {
    CampaignContentItem,
    SelectedCampaignAccount,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.types";

export type StrategyGroup = "main" | "music" | "press";

export type StrategyRow = {
    accountKey: string;
    account: SelectedCampaignAccount;
    platformItems: CampaignContentItem[];
    selectedItem: CampaignContentItem | null;
    selectedDescription: CampaignContentItem["descriptions"][number] | null;
    selectedContentIndex: number;
    selectedDescriptionIndex: number;
    dateMode: string;
    dateValue: string;
};

type MainProfileGroup = "creator" | "community";

type StrategyGroupedResult = {
    mainCreator: {
        title: string;
        accounts: SelectedCampaignAccount[];
        items: CampaignContentItem[];
    };
    mainCommunity: {
        title: string;
        accounts: SelectedCampaignAccount[];
        items: CampaignContentItem[];
    };
    music: {
        title: string;
        accounts: SelectedCampaignAccount[];
        items: CampaignContentItem[];
    };
    press: {
        title: string;
        accounts: SelectedCampaignAccount[];
        items: CampaignContentItem[];
    };
};

const normalizeSocial = (value: string) => String(value || "").toLowerCase();

const MAIN_SOCIALS = ["instagram", "tiktok", "youtube", "facebook"];
const MUSIC_SOCIALS = ["spotify", "soundcloud"];

const isMainSocial = (socialMedia: string) =>
    MAIN_SOCIALS.includes(normalizeSocial(socialMedia));

const isMusicSocial = (socialMedia: string) =>
    MUSIC_SOCIALS.includes(normalizeSocial(socialMedia));

const isPressSocial = (socialMedia: string) =>
    !isMainSocial(socialMedia) && !isMusicSocial(socialMedia);

const isMainProfile = (
    value: unknown,
): value is MainProfileGroup => value === "creator" || value === "community";

const getAccountKey = (account: SelectedCampaignAccount) =>
    String(account.accountId ?? "");

const getPlatformItemsForAccount = ({
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

    if (isMusicSocial(social)) {
        return items.filter((item) => item.socialMediaGroup === "music");
    }

    return items.filter((item) => item.socialMediaGroup === "press");
};

export const buildStrategyRows = ({
                                      accounts,
                                      items,
                                  }: {
    accounts: SelectedCampaignAccount[];
    items: CampaignContentItem[];
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

        const selectedDescription =
            descriptions[selectedDescriptionIndex] ?? null;

        const rawDateRequest = String(account.dateRequest ?? "ASAP");
        const [dateMode, dateValue = ""] = rawDateRequest.split(":");

        return {
            accountKey: getAccountKey(account),
            account,
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