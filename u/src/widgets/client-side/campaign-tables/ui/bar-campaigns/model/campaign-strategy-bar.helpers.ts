import { formatFollowers } from "@/utils/functions/formatFollowers";

type Account = {
    followers?: number;
};

type ContentItem = {
    _id?: string;
    socialMediaGroup?: string;
};

type Params = {
    totalPrice: number;
    accounts: Account[];
    content: ContentItem[];
    submittedAt?: string | Date | null;
    currency?: string;
};

export const buildCampaignBarData = ({
                                         totalPrice,
                                         accounts,
                                         content,
                                         submittedAt,
                                         currency
                                     }: Params) => {
    const totalFollowers = accounts.reduce((sum, account) => {
        return sum + Number(account.followers ?? 0);
    }, 0);

    const postsCount = accounts.length;
    const videosCount = content.filter(
        (item) => item.socialMediaGroup === "main",
    ).length;

    const submittedLabel = submittedAt
        ? `Submitted: ${new Date(submittedAt).toLocaleDateString()}`
        : "Submitted: —";

    return {
        submittedLabel,
        budgetLabel: `Budget: ${Number(totalPrice ?? 0)}${currency}`,
        reachLabel: `Reach: ${formatFollowers(totalFollowers)} followers`,
        postsLabel: `Posts: ${postsCount}`,
        videosLabel: `Video: ${videosCount}`,
    };
};