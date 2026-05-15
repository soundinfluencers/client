import {getGroupBySocial} from "@/client-side/widgets/campaign/card-table/table-card-draft.tsx";

export const buildProposalAccountsAfterSubmit = ({
                                              sourceAccounts,
                                              payloadAccounts,
                                              mergedContent,
                                          }: {
    sourceAccounts: any[];
    payloadAccounts: any[];
    mergedContent: any[];
}) => {
    return (sourceAccounts ?? []).map((sourceAccount) => {
        const sourceAccountId = String(
            sourceAccount.accountId ??
            sourceAccount.socialAccountId ??
            "",
        );

        const payloadAccount = (payloadAccounts ?? []).find((item) => {
            const payloadAccountId = String(
                item.socialAccountId ??
                item.accountId ??
                "",
            );

            return payloadAccountId === sourceAccountId;
        });

        const sm = String(sourceAccount.socialMedia ?? "").toLowerCase();
        const group = getGroupBySocial(sm);

        const contentItem =
            mergedContent.find(
                (item) => String(item.socialMedia ?? "").toLowerCase() === sm,
            ) ??
            mergedContent.find((item) => item.socialMediaGroup === group) ??
            null;

        const fallbackSelected = contentItem
            ? {
                campaignContentItemId: contentItem._id,
                descriptionId: contentItem.descriptions?.[0]?._id ?? "",
            }
            : null;

        const selected =
            payloadAccount?.selectedCampaignContentItem ??
            payloadAccount?.selectedContent ??
            fallbackSelected;

        return {
            ...sourceAccount,

            accountId: sourceAccountId,
            socialAccountId: sourceAccountId,

            influencerId:
                payloadAccount?.influencerId ??
                sourceAccount.influencerId,

            socialMedia: sm,
            username:
                payloadAccount?.username ??
                sourceAccount.username,

            profileType:
                payloadAccount?.profileType ??
                sourceAccount.profileType,

            price: Number(sourceAccount.price ?? sourceAccount.publicPrice ?? 0),
            publicPrice: Number(sourceAccount.publicPrice ?? sourceAccount.price ?? 0),

            followers: Number(sourceAccount.followers ?? 0),
            logoUrl: sourceAccount.logoUrl ?? "",
            countries: sourceAccount.countries ?? [],
            genres: sourceAccount.genres ?? [],

            dateRequest:
                payloadAccount?.dateRequest ??
                sourceAccount.dateRequest ??
                "ASAP",

            selectedContent: selected,
            selectedCampaignContentItem: selected,
        };
    });
};

export const attachExistingContentToAccounts = (
    accounts: any[],
    content: any[],
) => {
    return (accounts ?? []).map((account) => {
        const accountId = String(account.accountId ?? account.socialAccountId ?? "");
        const sm = String(account.socialMedia ?? "").toLowerCase();
        const group = getGroupBySocial(sm);

        const contentItem =
            content.find(
                (item) => String(item.socialMedia ?? "").toLowerCase() === sm,
            ) ??
            content.find((item) => item.socialMediaGroup === group) ??
            null;

        const selected = contentItem
            ? {
                campaignContentItemId: contentItem._id,
                descriptionId: contentItem.descriptions?.[0]?._id ?? "",
            }
            : null;

        return {
            ...account,
            accountId,
            socialAccountId: accountId,
            socialMedia: sm,
            price: Number(account.price ?? account.publicPrice ?? 0),
            publicPrice: Number(account.publicPrice ?? account.price ?? 0),
            followers: Number(account.followers ?? 0),
            dateRequest: account.dateRequest ?? "ASAP",
            selectedContent:
                account.selectedContent ??
                account.selectedCampaignContentItem ??
                selected,
            selectedCampaignContentItem:
                account.selectedCampaignContentItem ??
                account.selectedContent ??
                selected,
        };
    });
};