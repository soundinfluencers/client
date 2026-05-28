import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { CampaignPostContentPage } from "@/widgets/client-side/campaign-post-content/ui/campaign-post-content-page.tsx";
import styles from "./campaign-post-content.module.scss";

import {
    useCampaignBuilderStore,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store.ts";

import {
    useProposalAccountsStore,
} from "@/client-side/store";

import { Breadcrumbs, Container } from "@/components";
import {
    attachExistingContentToAccounts,
    buildProposalAccountsAfterSubmit
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

    const isAddInfluencerMode = mode === "add-influencer";

    const selectedAccounts = useCampaignBuilderStore((s) => s.selectedAccounts);
    const campaignName = useCampaignBuilderStore((s) => s.campaignName);
    const selectedOfferName = useCampaignBuilderStore((s) => s.selectedOfferName);
    const blocksDraft = useCampaignBuilderStore((s) => s.blocksDraft);
    const campaignContent = useCampaignBuilderStore((s) => s.campaignContent);
    const totalPrice = useCampaignBuilderStore((s) => s.totalPrice);
    const offerPrice = useCampaignBuilderStore((s) => s.selectedOfferPrice);
    const selectedCurrency = useCampaignBuilderStore((s) => s.selectedCurrency);
    const setCampaignContent = useCampaignBuilderStore((s) => s.actions.setCampaignContent);
    const syncSelectedAccountsContent = useCampaignBuilderStore(
        (s) => s.actions.syncSelectedAccountsContent,
    );
    const clearBuilder = useCampaignBuilderStore((s) => s.actions.reset);

    const proposalAccounts = useProposalAccountsStore(
        (s) => s.accountsByOption[optionIndex] ?? EMPTY_ACCOUNTS,
    );

    const proposalContent = useProposalAccountsStore(
        (s) => s.contentByOption[optionIndex] ?? EMPTY_CONTENT,
    );

    const addProposalAccounts = useProposalAccountsStore((s) => s.addAccounts);
    const mergeProposalContent = useProposalAccountsStore((s) => s.mergeContent);

    const mappedAccounts = React.useMemo(
        () =>
            selectedAccounts.map((item) => ({
                accountId: item.accountId,
                influencerId: item.influencerId,
                socialMedia: item.socialMedia,
                username: item.username,
                profileType: item.profileType,
                logoUrl: item.logoUrl,
                followers: item.followers,
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
                return String(existing.socialAccountId ?? existing.accountId) === String(selected.accountId);
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

        if (!accountsForPage.length) {
            navigate("/client/campaign");
            return;
        }

        if (missingGroups.length > 0) return;

        const preparedAccounts = attachExistingContentToAccounts(
            accountsForPage,
            proposalContent,
        );

        console.log("[ADD INFLUENCER AUTO] preparedAccounts", preparedAccounts);

        addProposalAccounts(optionIndex, preparedAccounts as any);

        clearBuilder?.();

        navigate("/client/campaign");
    }, [
        isAddInfluencerMode,
        accountsForPage,
        proposalContent,
        missingGroups.length,
        addProposalAccounts,
        optionIndex,
        clearBuilder,
        navigate,
    ]);

    const offerAccounts = accountsForPage.filter((item) => item.source === "offer");
    const manualAccounts = accountsForPage.filter((item) => item.source !== "offer");

    if (isAddInfluencerMode && missingGroups.length === 0) {
        return null;
    }

    return (
        <Container>
            <div className={styles.navMenu}>
                <Breadcrumbs />
            </div>

            <CampaignPostContentPage
                mode={isAddInfluencerMode ? "add-influencer" : "create"}
                allowedGroups={isAddInfluencerMode ? missingGroups : undefined}
                defaultCampaignContent={isAddInfluencerMode ? proposalContent : campaignContent}
                accounts={accountsForPage}
                offerAccounts={isAddInfluencerMode ? [] : offerAccounts}
                manualAccounts={manualAccounts}
                offerName={isAddInfluencerMode ? undefined : selectedOfferName}
                totalPrice={totalPrice}
                offerPrice={isAddInfluencerMode ? 0 : offerPrice}
                defaultCampaignName={campaignName}
                defaultBlocks={blocksDraft ?? undefined}
                currency={selectedCurrency}
                onSubmitPayload={(payload) => {
                    if (isAddInfluencerMode) {
                        const mergedContent = [...proposalContent, ...payload.campaignContent];

                        const preparedAccounts = buildProposalAccountsAfterSubmit({
                            sourceAccounts: accountsForPage,
                            payloadAccounts: payload.addedAccounts,
                            mergedContent,
                        });

                        console.log("[ADD INFLUENCER] payload.addedAccounts", payload.addedAccounts);
                        console.log("[ADD INFLUENCER] accountsForPage", accountsForPage);
                        console.log("[ADD INFLUENCER] preparedAccounts", preparedAccounts);
                        console.log("[ADD INFLUENCER] mergedContent", mergedContent);

                        mergeProposalContent(optionIndex, payload.campaignContent);
                        addProposalAccounts(optionIndex, preparedAccounts as any);

                        clearBuilder?.();

                        navigate("/client/campaign");
                        return;
                    }

                    setCampaignContent(payload.campaignContent);
                    syncSelectedAccountsContent(payload.addedAccounts);

                    navigate("/client/create-campaign/content/strategy");
                }}
            />
        </Container>
    );
};