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
    const blocksDraft = useCampaignBuilderStore((s) => s.blocksDraft);
    const campaignContent = useCampaignBuilderStore((s) => s.campaignContent);
    const totalPrice = useCampaignBuilderStore((s) => s.totalPrice);
    const offerPrice = useCampaignBuilderStore((s) => s.selectedOfferPrice);
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
                accountId: item.accountId,
                socialAccountId: item.accountId,

                influencerId: item.influencerId,
                socialMedia: item.socialMedia,
                username: item.username,
                profileType: item.profileType,
                logoUrl: item.logoUrl,

                followers: Number(item.followers ?? 0),
                price: Number(item.price ?? 0),
                publicPrice: Number(item.price ?? 0),

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
                defaultCampaignContent={
                    isAddInfluencerMode ? proposalContent : campaignContent
                }
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
                    syncSelectedAccountsContent(payload.addedAccounts);

                    navigate("/client/create-campaign/content/strategy");
                }}
            />
        </Container>
    );
};