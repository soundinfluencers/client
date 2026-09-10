export type ContentGroup = "main" | "music" | "press";

export type ContentItem = {
    _id?: string;
    id?: string;
    socialMedia?: string;
    socialMediaGroup?: ContentGroup | string;
    [key: string]: any;
};

export type AccountItem = {
    selectedContent?: {
        campaignContentItemId?: string;
        descriptionId?: string;
    } | null;

    selectedCampaignContentItem?: {
        _id?: string;
        campaignContentItemId?: string;
        descriptionId?: string;
    } | null;

    selectedContentItem?: {
        _id?: string;
        socialMedia?: string;
    } | null;

    socialMedia?: string;
    [key: string]: any;
};

export const getContentId = (item: ContentItem) => {
    return String(item?._id ?? item?.id ?? "");
};

export const getAccountSelectedContentId = (account: AccountItem) => {
    return String(
        account?.selectedContent?.campaignContentItemId ??
        account?.selectedCampaignContentItem?.campaignContentItemId ??
        "",
    );
};

export const groupContentBySocialGroup = <T extends ContentItem>(content: T[]) => {
    return {
        main: (content ?? []).filter(
            (item) => String(item?.socialMediaGroup ?? "") === "main",
        ),
        music: (content ?? []).filter(
            (item) => String(item?.socialMediaGroup ?? "") === "music",
        ),
        press: (content ?? []).filter(
            (item) => String(item?.socialMediaGroup ?? "") === "press",
        ),
    };
};

export const buildAccountsByContentId = <T extends AccountItem>(accounts: T[]) => {
    return (accounts ?? []).reduce<Record<string, T[]>>(
        (result, account) => {
            const contentId = getAccountSelectedContentId(account);

            if (!contentId) return result;

            if (!result[contentId]) {
                result[contentId] = [];
            }

            result[contentId].push(account);

            return result;
        },
        {},
    );
};

export const filterContentWithAccounts = <T extends ContentItem>(
    content: T[],
    accountsByContentId: Record<string, AccountItem[]>,
) => {
    return (content ?? []).filter((item) => {
        const contentId = getContentId(item);
        return (accountsByContentId[contentId] ?? []).length > 0;
    });
};

export const getNetworksForContentItem = (
    item: ContentItem,
    accountsByContentId: Record<string, AccountItem[]>,
) => {
    const contentId = getContentId(item);
    return accountsByContentId[contentId] ?? [];
};

export const buildLiveViewGroups = <C extends ContentItem, A extends AccountItem>({
                                        content,
                                        accounts,
                                    }: {
    content: C[];
    accounts: A[];
}) => {
    const byGroup = groupContentBySocialGroup(content);
    const accountsByContentId = buildAccountsByContentId(accounts);

    return {
        accountsByContentId,

        byGroup,

        visibleByGroup: {
            main: filterContentWithAccounts(byGroup.main, accountsByContentId),
            music: filterContentWithAccounts(byGroup.music, accountsByContentId),
            press: filterContentWithAccounts(byGroup.press, accountsByContentId),
        },
    };
};
