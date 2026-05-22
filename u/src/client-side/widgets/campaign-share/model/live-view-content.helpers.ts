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
        campaignContentItemId?: string;
        descriptionId?: string;
    } | null;

    selectedContentItem?: {
        _id?: string;
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

export const groupContentBySocialGroup = (content: ContentItem[]) => {
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

export const buildAccountsByContentId = (accounts: AccountItem[]) => {
    return (accounts ?? []).reduce<Record<string, AccountItem[]>>(
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

export const filterContentWithAccounts = (
    content: ContentItem[],
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

export const buildLiveViewGroups = ({
                                        content,
                                        accounts,
                                    }: {
    content: ContentItem[];
    accounts: AccountItem[];
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