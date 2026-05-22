import React from "react";
import {
    useDraftCampaignStore,
    useProposalAccountsStore,
    useStrategyCampaignStore,
    useUpdateCampaign,
} from "@/client-side/store";
import { useGroupPromos } from "@/client-side/hooks";
import {
    applyPatches,
    ensureContentGroupsFromAccounts,
    buildResolvedCampaignContent, getAccountsByContentId, filterContentWithAccounts,
} from "./campaign-content.utils";
import {calcGroupPrices} from "@/client-side/utils";

const EMPTY_ARRAY: any[] = [];

export const useCampaignContentData = ({
                                           campaign,
                                           view,
                                           flag,
                                       }: {
    campaign: any;
    view: number;
    flag: boolean;
}) => {
    const patches = useUpdateCampaign((s) => s.patches);

    const proposalOptionIndex = campaign?.selectedOption?.optionIndex ?? 0;
    const regularCampaignId = campaign?.campaignId ?? "";
    const draftCampaignId = campaign?.draftId ?? "";

    const proposalContentRaw = useProposalAccountsStore(
        (s) => s.contentByOption?.[proposalOptionIndex],
    );
    const proposalAccountsRaw = useProposalAccountsStore(
        (s) => s.accountsByOption?.[proposalOptionIndex],
    );

    const regularContentRaw = useStrategyCampaignStore(
        (s) => s.contentByCampaignId?.[regularCampaignId],
    );
    const regularAccountsRaw = useStrategyCampaignStore(
        (s) => s.accountsByCampaignId?.[regularCampaignId],
    );

    const draftContentRaw = useDraftCampaignStore(
        (s) => s.contentByCampaignId?.[draftCampaignId],
    );
    const draftAccountsRaw = useDraftCampaignStore(
        (s) => s.accountsByCampaignId?.[draftCampaignId],
    );

    const proposalContent = proposalContentRaw ?? EMPTY_ARRAY;
    const proposalAccounts = proposalAccountsRaw ?? EMPTY_ARRAY;
    const regularContent = regularContentRaw ?? EMPTY_ARRAY;
    const regularAccounts = regularAccountsRaw ?? EMPTY_ARRAY;
    const draftContent = draftContentRaw ?? EMPTY_ARRAY;
    const draftAccounts = draftAccountsRaw ?? EMPTY_ARRAY;

    const resolved = React.useMemo(() => {
        if (campaign?.kind === "proposal") {
            const baseContent =
                proposalContent.length > 0
                    ? proposalContent
                    : (campaign?.selectedOption?.campaignContent ?? EMPTY_ARRAY);

            const patchedContent = applyPatches(baseContent, patches);
            const accounts =
                proposalAccounts.length > 0
                    ? proposalAccounts
                    : (campaign?.selectedOption?.addedAccounts ?? EMPTY_ARRAY);

            const content = ensureContentGroupsFromAccounts(accounts, patchedContent);

            console.log("PROPOSAL HOOK campaign id", campaign?.campaignId);
            console.log("PROPOSAL HOOK optionIndex", proposalOptionIndex);
            console.log("PROPOSAL HOOK raw proposalContent", proposalContent);
            console.log("PROPOSAL HOOK raw proposalAccounts", proposalAccounts);
            console.log("PROPOSAL HOOK accounts final", accounts);
            console.log("PROPOSAL HOOK content final", content);

            return buildResolvedCampaignContent({
                kind: "proposal",
                campaign,
                accounts,
                content,
                view,
                flag,
            });
        }

        if (campaign?.kind === "regular") {
            const baseContent =
                regularContent.length > 0
                    ? regularContent
                    : (campaign?.campaignContent ?? EMPTY_ARRAY);

            const content = applyPatches(baseContent, patches);
            const accounts =
                regularAccounts.length > 0
                    ? regularAccounts
                    : (campaign?.addedAccounts ?? EMPTY_ARRAY);

            return buildResolvedCampaignContent({
                kind: "regular",
                campaign,
                accounts,
                content,
                view,
                flag,
            });
        }

        const baseContent =
            draftContent.length > 0
                ? draftContent
                : (campaign?.campaignContent ?? EMPTY_ARRAY);

        const content = applyPatches(baseContent, patches);
        const accounts =
            draftAccounts.length > 0
                ? draftAccounts
                : (campaign?.addedAccounts ?? EMPTY_ARRAY);

        return buildResolvedCampaignContent({
            kind: "draft",
            campaign,
            accounts,
            content,
            view,
            flag,
        });
    }, [
        campaign,
        proposalContent,
        proposalAccounts,
        regularContent,
        regularAccounts,
        draftContent,
        draftAccounts,
        patches,
        view,
        flag,
    ]);

    const promos = useGroupPromos(resolved.accounts);
    console.log("resolved.accounts", resolved.accounts);
    const { groupPrices } = React.useMemo(
        () => calcGroupPrices(resolved.accounts),
        [resolved.accounts],
    );
    const accountsByContentId = React.useMemo(
        () => getAccountsByContentId(resolved.accounts),
        [resolved.accounts],
    );

    const visibleByGroup = React.useMemo(
        () => ({
            main: filterContentWithAccounts({
                content: resolved.byGroup.main,
                accountsByContentId,
            }),
            music: filterContentWithAccounts({
                content: resolved.byGroup.music,
                accountsByContentId,
            }),
            press: filterContentWithAccounts({
                content: resolved.byGroup.press,
                accountsByContentId,
            }),
        }),
        [resolved.byGroup, accountsByContentId],
    );
    return {
        ...resolved,
        ...promos,
        groupPrices,
        accountsByContentId,
        visibleByGroup,
    };
};