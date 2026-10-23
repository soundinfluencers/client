import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { CampaignPostContentPage } from "@/widgets/client-side/campaign-post-content/ui/campaign-post-content-page.tsx";
import styles from "./campaign-post-content.module.scss";

import { useCampaignBuilderStore } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store.ts";
import { useCampaignStore } from "@/entities/client-side/campaign/store/campaign.store";

import { Breadcrumbs, Container } from "@/components";
import {
    attachExistingContentToAccounts,
    buildProposalAccountsAfterSubmit,
} from "@/pages/client-side/campaign-post-content/model/build-proposal-accounts.ts";

type GroupKey = "main" | "music" | "press";

const MAIN_NETWORKS = ["facebook", "instagram", "youtube", "tiktok"];
const MUSIC_NETWORKS = ["spotify", "soundcloud"];

const EMPTY_ACCOUNTS: any[] = [];
const EMPTY_CONTENT: any[] = [];

const getGroupBySocial = (social?: string): GroupKey => {
    const s = String(social ?? "").toLowerCase();

    if (MAIN_NETWORKS.includes(s)) return "main";
    if (MUSIC_NETWORKS.includes(s)) return "music";

    return "press";
};

const getGroupsFromAccounts = (accounts: any[]) => {
    return new Set<GroupKey>(
        (accounts ?? []).map((account) => getGroupBySocial(account.socialMedia)),
    );
};

const getGroupsFromContent = (content: any[]) => {
    return new Set<GroupKey>(
        (content ?? [])
            .map((item) => item.socialMediaGroup as GroupKey)
            .filter(Boolean),
    );
};

export const CampaignPostContentRoute = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const mode = searchParams.get("mode");
    const optionIndex = Number(searchParams.get("option") ?? 0);
    const returnTo = searchParams.get("returnTo")
        ? decodeURIComponent(String(searchParams.get("returnTo")))
        : "/client/campaign";

    const isAddInfluencerMode = mode === "add-influencer";

    const editable = useCampaignStore((s) => s.editable);
    const addCampaignAccounts = useCampaignStore((s) => s.addAccounts);
    const mergeCampaignContent = useCampaignStore((s) => s.mergeCampaignContent);

    const selectedAccounts = useCampaignBuilderStore((s) => s.selectedAccounts);
    const campaignName = useCampaignBuilderStore((s) => s.campaignName);
    const selectedOfferName = useCampaignBuilderStore((s) => s.selectedOfferName);
    const selectedOfferAccountIds = useCampaignBuilderStore((s) => s.selectedOfferAccountIds);
    const blocksDraft = useCampaignBuilderStore((s) => s.blocksDraft);
    const campaignContent = useCampaignBuilderStore((s) => s.campaignContent);
    const totalPrice = useCampaignBuilderStore((s) => s.totalPrice);
    const totalPriceReady = useCampaignBuilderStore((s) => s.totalPriceReady);
    const offerPrice = useCampaignBuilderStore((s) => s.selectedOfferPrice);
    const offerAvailable = useCampaignBuilderStore((s) => s.selectedOfferIsAvailable);
    const selectedCurrency = useCampaignBuilderStore((s) => s.selectedCurrency);

    const setCampaignContent = useCampaignBuilderStore(
        (s) => s.actions.setCampaignContent,
    );
    const syncSelectedAccountsContent = useCampaignBuilderStore(
        (s) => s.actions.syncSelectedAccountsContent,
    );
    const clearBuilder = useCampaignBuilderStore((s) => s.actions.reset);

    const proposalAccounts = editable?.addedAccounts ?? EMPTY_ACCOUNTS;
    const proposalContent = editable?.campaignContent ?? EMPTY_CONTENT;

    const mappedAccounts = React.useMemo(
        () =>
            selectedAccounts.map((item) => ({
                selectionId: item.selectionId,
                selectedCampaignContentItem: item.selectedCampaignContentItem,
                accountId: item.accountId,
                socialAccountId: item.accountId,

                influencerId: item.influencerId,
                socialMedia: item.socialMedia,
                username: item.username,
                profileType: item.profileType,
                logoUrl: item.logoUrl,

                followers: Number(item.followers ?? 0),
                price: item.price,
                publicPrice: item.price,

                dateRequest: item.dateRequest ?? "ASAP",
                source: item.source,
                countries: item.countries,
                genres: item.genres,
            })),
        [selectedAccounts],
    );

    const accountsForPage = React.useMemo(() => {
        if (!isAddInfluencerMode) return mappedAccounts;

        return mappedAccounts.filter((selected) => {
            return !proposalAccounts.some((existing: any) => {
                return (
                    String(existing.socialAccountId ?? existing.accountId) ===
                    String(selected.socialAccountId ?? selected.accountId)
                );
            });
        });
    }, [isAddInfluencerMode, mappedAccounts, proposalAccounts]);

    const existingGroups = React.useMemo(
        () => getGroupsFromContent(proposalContent),
        [proposalContent],
    );

    const selectedGroups = React.useMemo(
        () => getGroupsFromAccounts(accountsForPage),
        [accountsForPage],
    );

    const missingGroups = React.useMemo(() => {
        const result: GroupKey[] = [];

        selectedGroups.forEach((group) => {
            if (!existingGroups.has(group)) {
                result.push(group);
            }
        });

        return result;
    }, [selectedGroups, existingGroups]);

    React.useEffect(() => {
        if (!isAddInfluencerMode) return;

        if (!editable) {
            navigate(returnTo);
            return;
        }

        if (!accountsForPage.length) {
            navigate(returnTo);
            return;
        }

        if (missingGroups.length > 0) return;

        const preparedAccounts = attachExistingContentToAccounts(
            accountsForPage,
            proposalContent,
        );

        addCampaignAccounts(preparedAccounts as any);

        clearBuilder?.();

        navigate(returnTo);
    }, [
        isAddInfluencerMode,
        editable,
        accountsForPage,
        proposalContent,
        missingGroups.length,
        addCampaignAccounts,
        clearBuilder,
        navigate,
        returnTo,
    ]);

    const isOfferRow = (item: typeof accountsForPage[number]) => item.source === "offer" ||
        selectedOfferAccountIds.includes(item.accountId);
    const offerAccounts = accountsForPage.filter(isOfferRow);
    const manualAccounts = accountsForPage.filter((item) => !isOfferRow(item));

    if (isAddInfluencerMode && missingGroups.length === 0) {
        return null;
    }

    return (
        <Container>
            <div className={styles.navMenu}>
                <Breadcrumbs />
            </div>
            {!isAddInfluencerMode && new Set(selectedAccounts.map((a) => a.accountId)).size !== selectedAccounts.length && <div role="alert">
                <p>This draft contains duplicate account selections with potentially different content. Review the rows and explicitly remove unwanted selections before checkout.</p>
                {selectedAccounts.filter((a) => selectedAccounts.filter((b) => b.accountId === a.accountId).length > 1).map((a) =>
                    <p key={a.selectionId}>{a.username} — selection {a.selectionId}, description {a.selectedCampaignContentItem?.descriptionId ?? "none"}
                        <button type="button" onClick={() => useCampaignBuilderStore.getState().actions.removeSelection(a.selectionId!)}>Remove this selection</button>
                    </p>)}
            </div>}

            <CampaignPostContentPage
                mode={isAddInfluencerMode ? "add-influencer" : "create"}
                allowedGroups={isAddInfluencerMode ? missingGroups : undefined}
                defaultCampaignContent={
                    isAddInfluencerMode ? proposalContent : campaignContent
                }
                accounts={accountsForPage}
                offerAccounts={isAddInfluencerMode ? [] : offerAccounts}
                manualAccounts={manualAccounts}
                offerName={isAddInfluencerMode ? undefined : selectedOfferName}
                offerAvailable={isAddInfluencerMode ? undefined : offerAvailable}
                totalPrice={totalPrice}
                totalPriceReady={isAddInfluencerMode ? true : totalPriceReady}
                offerPrice={isAddInfluencerMode ? 0 : offerPrice}
                defaultCampaignName={campaignName}
                defaultBlocks={blocksDraft ?? undefined}
                currency={selectedCurrency}
                onSubmitPayload={(payload) => {
                    if (isAddInfluencerMode) {
                        const mergedContent = [
                            ...proposalContent,
                            ...payload.campaignContent,
                        ];

                        const preparedAccounts = buildProposalAccountsAfterSubmit({
                            sourceAccounts: accountsForPage,
                            payloadAccounts: payload.addedAccounts,
                            mergedContent,
                        });

                        mergeCampaignContent(payload.campaignContent as any);
                        addCampaignAccounts(preparedAccounts as any);

                        clearBuilder?.();

                        navigate(returnTo);
                        return;
                    }

                    setCampaignContent(payload.campaignContent);
                    const current = useCampaignBuilderStore.getState();
                    const remainingRows = payload.addedAccounts.filter((row) => current.selectedAccounts.some((account) =>
                        row.selectionId ? account.selectionId === row.selectionId : account.accountId === row.socialAccountId));
                    syncSelectedAccountsContent(remainingRows);

                    navigate(`/client/create-campaign/content/strategy?currency=${selectedCurrency === "$" ? "USD" : selectedCurrency === "£" ? "GBP" : "EUR"}`);
                }}
            />
        </Container>
    );
};
