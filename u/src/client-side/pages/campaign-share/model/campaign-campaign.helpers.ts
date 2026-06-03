import {
    filterContentWithAccounts,
    getAccountsByContentId, getAccountSelectedContentId
} from "@/client-side/widgets/campaign/model/campaign-content.utils.ts";

export const getVisibleCampaignStats = ({
                                            accounts,
                                            content,
                                        }: {
    accounts: any[];
    content: any[];
}) => {
    const accountsByContentId = getAccountsByContentId(accounts);

    const visibleContent = filterContentWithAccounts({
        content,
        accountsByContentId,
    });

    const visibleContentIds = new Set(
        visibleContent.map((item: any) => String(item?._id ?? "")),
    );

    const visibleAccounts = accounts.filter((account: any) => {
        const contentId = getAccountSelectedContentId(account);
        return visibleContentIds.has(contentId);
    });

    return {
        visibleAccounts,
        visibleContent,
        postsCount: visibleAccounts.length,
        videosCount: visibleContent.length,
    };
};