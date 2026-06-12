import type {
    EditableCampaignAccount,
    EditableCampaignContentItem,
} from "@/entities/client-side/campaign/store/campaign.store";
import type {
    CampaignTableRow,
    CampaignTableSectionData,
    StrategyGroup,
} from "./campaign-table.types";

const normalizeSocial = (value: unknown) => {
    return String(value ?? "").trim().toLowerCase();
};

const MAIN_SOCIALS = ["instagram", "tiktok", "youtube", "facebook"];
const MUSIC_SOCIALS = ["spotify", "soundcloud"];

const isMainSocial = (socialMedia: string) =>
    MAIN_SOCIALS.includes(normalizeSocial(socialMedia));

const isMusicSocial = (socialMedia: string) =>
    MUSIC_SOCIALS.includes(normalizeSocial(socialMedia));

const isPressSocial = (socialMedia: string) =>
    !isMainSocial(socialMedia) && !isMusicSocial(socialMedia);

const isMainProfile = (value: unknown) => {
    return value === "creator" || value === "community";
};

export const getCampaignAccountKey = (account: EditableCampaignAccount) => {
    return String(
        account?.__clientId ??
        account?.addedAccountsId ??
        account?.socialAccountId ??
        account?.username ??
        "",
    );
};

const getPlatformItemsForAccount = ({
                                        account,
                                        items = [],
                                    }: {
    account: EditableCampaignAccount;
    items?: EditableCampaignContentItem[];
}): EditableCampaignContentItem[] => {
    const safeItems = Array.isArray(items) ? items : [];
    const social = normalizeSocial(account?.socialMedia);

    if (isMainSocial(social)) {
        const exactBySocialAndProfile = safeItems.filter(
            (item) =>
                item.socialMediaGroup === "main" &&
                normalizeSocial(item.socialMedia) === social &&
                item.profileType === account.profileType,
        );

        if (exactBySocialAndProfile.length > 0) return exactBySocialAndProfile;

        const exactBySocial = safeItems.filter(
            (item) =>
                item.socialMediaGroup === "main" &&
                normalizeSocial(item.socialMedia) === social,
        );

        if (exactBySocial.length > 0) return exactBySocial;
    }

    const exactBySocial = safeItems.filter(
        (item) => normalizeSocial(item.socialMedia) === social,
    );

    if (exactBySocial.length > 0) return exactBySocial;

    if (isMusicSocial(social)) {
        return safeItems.filter((item) => item.socialMediaGroup === "music");
    }

    return safeItems.filter((item) => item.socialMediaGroup === "press");
};

export const buildCampaignTableRows = ({
                                           accounts = [],
                                           items = [],
                                           group,
                                       }: {
    accounts?: EditableCampaignAccount[];
    items?: EditableCampaignContentItem[];
    group: StrategyGroup;
}): CampaignTableRow[] => {
    const safeAccounts = Array.isArray(accounts) ? accounts : [];
    const safeItems = Array.isArray(items) ? items : [];

    return safeAccounts.map((account) => {
        const platformItems = getPlatformItemsForAccount({
            account,
            items: safeItems,
        });

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
            accountKey: getCampaignAccountKey(account),
            account,
            group,

            platformItems,
            selectedItem,
            selectedDescription,
            selectedCampaignContentItem: selected,

            selectedContentIndex,
            selectedDescriptionIndex,

            dateMode,
            dateValue,
        };
    });
};

export const groupEditableCampaignData = ({
                                              accounts = [],
                                              items = [],
                                          }: {
    accounts?: EditableCampaignAccount[];
    items?: EditableCampaignContentItem[];
}): {
    mainCreator: CampaignTableSectionData;
    mainCommunity: CampaignTableSectionData;
    music: CampaignTableSectionData;
    press: CampaignTableSectionData;
} => {
    const safeAccounts = Array.isArray(accounts) ? accounts : [];
    const safeItems = Array.isArray(items) ? items : [];

    const mainCreatorAccounts = safeAccounts.filter(
        (account) =>
            isMainSocial(account.socialMedia) &&
            account.profileType === "creator",
    );

    const mainCommunityAccounts = safeAccounts.filter(
        (account) =>
            isMainSocial(account.socialMedia) &&
            account.profileType === "community",
    );

    const musicAccounts = safeAccounts.filter((account) =>
        isMusicSocial(account.socialMedia),
    );

    const pressAccounts = safeAccounts.filter((account) =>
        isPressSocial(account.socialMedia),
    );

    const mainCreatorItems = safeItems.filter(
        (item) =>
            item.socialMediaGroup === "main" &&
            isMainProfile(item.profileType) &&
            item.profileType === "creator",
    );

    const mainCommunityItems = safeItems.filter(
        (item) =>
            item.socialMediaGroup === "main" &&
            isMainProfile(item.profileType) &&
            item.profileType === "community",
    );

    const musicItems = safeItems.filter(
        (item) => item.socialMediaGroup === "music",
    );

    const pressItems = safeItems.filter(
        (item) => item.socialMediaGroup === "press",
    );

    return {
        mainCreator: {
            title: "Video Distribution — Creators",
            group: "main",
            accounts: mainCreatorAccounts,
            items: mainCreatorItems,
        },
        mainCommunity: {
            title: "Video Distribution — Communities",
            group: "main",
            accounts: mainCommunityAccounts,
            items: mainCommunityItems,
        },
        music: {
            title: "Music Placements",
            group: "music",
            accounts: musicAccounts,
            items: musicItems,
        },
        press: {
            title: "Press Coverage",
            group: "press",
            accounts: pressAccounts,
            items: pressItems,
        },
    };
};

export const getTotalFollowers = (accounts: EditableCampaignAccount[] = []) => {
    return (accounts ?? []).reduce((sum, account) => {
        return sum + Number(account.followers ?? 0);
    }, 0);
};

export const getTotalPrice = (accounts: EditableCampaignAccount[] = []) => {
    return (accounts ?? []).reduce((sum, account) => {
        return sum + Number(account.publicPrice ?? 0);
    }, 0);
};