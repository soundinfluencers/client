import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { CampaignPostContentPage } from "@/widgets/client-side/campaign-post-content/ui/campaign-post-content-page.tsx";
import styles from "./campaign-post-content.module.scss";

import { useCampaignBuilderStore } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store.ts";
import { useProposalAccountsStore } from "@/client-side/store";

import { Breadcrumbs, Container, Loader } from "@/components";
import {
    attachExistingContentToAccounts,
    buildProposalAccountsAfterSubmit,
} from "@/pages/client-side/campaign-post-content/model/build-proposal-accounts.ts";
import {
    CAMPAIGN_CURRENCY_OPTIONS,
} from "@/features/client-side/campaign-creator-page/build-campaign-filters/build-campaign-params.constants";
import {
    mapSelectedBundlesToPostContentSummaries,
} from "@/widgets/client-side/campaign-post-content/model/campaign-post-content-selection.mappers";
import {
    isProposalOptionCreateRequested,
    parseProposalOptionCreateContext,
    PROPOSAL_OPTION_CREATE_MODE,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder-navigation";
import {
    useCreateProposalOptionFromBuilder,
} from "@/pages/client-side/campaign-post-content/model/use-create-proposal-option-from-builder";

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
    const committedProposalAddKeyRef = React.useRef<string | null>(null);

    const mode = searchParams.get("mode");
    const optionIndex = Number(searchParams.get("option") ?? 0);
    const returnTo = searchParams.get("returnTo")
        ? decodeURIComponent(String(searchParams.get("returnTo")))
        : "/client/campaign";

    const isAddInfluencerMode = mode === "add-influencer";
    const isProposalOptionCreateMode =
        isProposalOptionCreateRequested(searchParams);
    const proposalOptionCreateContext =
        parseProposalOptionCreateContext(searchParams);
    const proposalOptionCreate = useCreateProposalOptionFromBuilder(
        proposalOptionCreateContext,
    );
    const hasInvalidProposalOptionCreateContext =
        isProposalOptionCreateMode && !proposalOptionCreateContext;
    const proposalAddKey = `${optionIndex}:${returnTo}`;

    const proposalSnapshot = useProposalAccountsStore(
        (s) => s.optionSnapshotsByIndex[optionIndex],
    );
    const proposalAccounts = useProposalAccountsStore(
        (s) => s.accountsByOption[optionIndex] ?? EMPTY_ACCOUNTS,
    );
    const proposalContent = useProposalAccountsStore(
        (s) => s.contentByOption[optionIndex] ?? EMPTY_CONTENT,
    );
    const addProposalAccounts = useProposalAccountsStore((s) => s.addAccounts);
    const mergeProposalContent = useProposalAccountsStore((s) => s.mergeContent);
    const setPendingTopology = useProposalAccountsStore(
        (s) => s.setPendingTopology,
    );

    const selectedAccounts = useCampaignBuilderStore((s) => s.selectedAccounts);
    const selectedBundles = useCampaignBuilderStore((s) => s.selectedBundles);
    const campaignName = useCampaignBuilderStore((s) => s.campaignName);
    const selectedOfferName = useCampaignBuilderStore((s) => s.selectedOfferName);
    const selectedOfferId = useCampaignBuilderStore((s) => s.selectedOfferId);
    const selectedOfferAccountIds = useCampaignBuilderStore(
        (s) => s.selectedOfferAccountIds,
    );
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

    React.useEffect(() => {
        if (!hasInvalidProposalOptionCreateContext) return;

        clearBuilder();
        navigate("/client/campaign", { replace: true });
    }, [
        clearBuilder,
        hasInvalidProposalOptionCreateContext,
        navigate,
    ]);

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
                bundleId: item.bundleId,
                countries: item.countries,
                genres: item.genres,
            })),
        [selectedAccounts],
    );

    const selectedCurrencyCode = React.useMemo(
        () =>
            CAMPAIGN_CURRENCY_OPTIONS.find(
                (option) =>
                    option.key === selectedCurrency ||
                    option.currency === selectedCurrency,
            )?.currency,
        [selectedCurrency],
    );

    const bundleSummaries = React.useMemo(
        () =>
            mapSelectedBundlesToPostContentSummaries(
                selectedBundles,
                selectedCurrencyCode,
            ),
        [selectedBundles, selectedCurrencyCode],
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
        if (committedProposalAddKeyRef.current === proposalAddKey) return;

        if (!proposalSnapshot) {
            navigate(returnTo);
            return;
        }

        const applyTopology = (preparedNewAccounts: any[]) => {
            const preparedBySocialId = new Map(
                preparedNewAccounts.map((account) => [
                    String(account.socialAccountId ?? account.accountId ?? ""),
                    account,
                ]),
            );
            const intendedAccounts = mappedAccounts.map((account) =>
                preparedBySocialId.get(
                    String(account.socialAccountId ?? account.accountId ?? ""),
                ) ?? account,
            );

            setPendingTopology(optionIndex, {
                bundles: Object.fromEntries(
                    selectedBundles.map((bundle) => [
                        bundle.bundleId,
                        bundle.accounts.map((account) => account.accountId),
                    ]),
                ),
                ...(selectedOfferId
                    ? {
                        selectedOffer: {
                            offerId: selectedOfferId,
                            selectedAccountIds: [...selectedOfferAccountIds],
                        },
                    }
                    : {}),
            });
            addProposalAccounts(optionIndex, intendedAccounts as any);
        };

        if (!accountsForPage.length) {
            committedProposalAddKeyRef.current = proposalAddKey;
            applyTopology([]);
            clearBuilder?.();
            navigate(returnTo);
            return;
        }

        if (missingGroups.length > 0) return;

        const preparedAccounts = attachExistingContentToAccounts(
            accountsForPage,
            proposalContent,
        );

        committedProposalAddKeyRef.current = proposalAddKey;
        applyTopology(preparedAccounts);

        clearBuilder?.();

        navigate(returnTo);
    }, [
        isAddInfluencerMode,
        proposalSnapshot,
        accountsForPage,
        mappedAccounts,
        proposalContent,
        selectedBundles,
        selectedOfferId,
        selectedOfferAccountIds,
        missingGroups.length,
        optionIndex,
        addProposalAccounts,
        setPendingTopology,
        clearBuilder,
        navigate,
        returnTo,
        proposalAddKey,
    ]);

    const offerAccounts = accountsForPage.filter((item) => item.source === "offer");
    const manualAccounts = accountsForPage.filter(
        (item) => item.source === "manual" || item.source == null,
    );

    if (hasInvalidProposalOptionCreateContext) return null;

    if (
        isProposalOptionCreateMode &&
        proposalOptionCreate.isFinalizing
    ) {
        return <Loader />;
    }

    if (isAddInfluencerMode && missingGroups.length === 0) {
        return null;
    }

    return (
        <Container>
            <div className={styles.navMenu}>
                <Breadcrumbs />
            </div>

            <CampaignPostContentPage
                mode={
                    isAddInfluencerMode
                        ? "add-influencer"
                        : isProposalOptionCreateMode
                            ? PROPOSAL_OPTION_CREATE_MODE
                            : "create"
                }
                proposalOptionCreateContext={proposalOptionCreateContext}
                allowedGroups={isAddInfluencerMode ? missingGroups : undefined}
                defaultCampaignContent={
                    isAddInfluencerMode ? proposalContent : campaignContent
                }
                accounts={accountsForPage}
                offerAccounts={isAddInfluencerMode ? [] : offerAccounts}
                bundles={isAddInfluencerMode ? [] : bundleSummaries}
                manualAccounts={manualAccounts}
                offerName={isAddInfluencerMode ? undefined : selectedOfferName}
                totalPrice={totalPrice}
                offerPrice={isAddInfluencerMode ? 0 : offerPrice}
                defaultCampaignName={campaignName}
                defaultBlocks={blocksDraft ?? undefined}
                currency={selectedCurrency}
                isSubmitLocked={
                    isProposalOptionCreateMode &&
                    proposalOptionCreate.isSubmitLocked
                }
                submitLabel={
                    isProposalOptionCreateMode
                        ? proposalOptionCreate.isSubmitting
                            ? proposalOptionCreate.isLoadingOption
                                ? "Loading option..."
                                : "Creating option..."
                            : proposalOptionCreate.createdIdentity
                                ? "Retry loading option"
                                : "Continue"
                        : "Continue"
                }
                onSubmitPayload={async (payload) => {
                    if (isAddInfluencerMode) {
                        if (committedProposalAddKeyRef.current === proposalAddKey) {
                            return;
                        }
                        committedProposalAddKeyRef.current = proposalAddKey;

                        const mergedContent = [
                            ...proposalContent,
                            ...payload.campaignContent,
                        ];

                        const preparedAccounts = buildProposalAccountsAfterSubmit({
                            sourceAccounts: accountsForPage,
                            payloadAccounts: payload.addedAccounts,
                            mergedContent,
                        });

                        mergeProposalContent(
                            optionIndex,
                            payload.campaignContent as any,
                        );

                        const preparedBySocialId = new Map(
                            preparedAccounts.map((account) => [
                                String(
                                    account.socialAccountId ??
                                    account.accountId ??
                                    "",
                                ),
                                account,
                            ]),
                        );
                        const intendedAccounts = mappedAccounts.map((account) =>
                            preparedBySocialId.get(
                                String(
                                    account.socialAccountId ??
                                    account.accountId ??
                                    "",
                                ),
                            ) ?? account,
                        );

                        setPendingTopology(optionIndex, {
                            bundles: Object.fromEntries(
                                selectedBundles.map((bundle) => [
                                    bundle.bundleId,
                                    bundle.accounts.map((account) => account.accountId),
                                ]),
                            ),
                            ...(selectedOfferId
                                ? {
                                    selectedOffer: {
                                        offerId: selectedOfferId,
                                        selectedAccountIds: [
                                            ...selectedOfferAccountIds,
                                        ],
                                    },
                                }
                                : {}),
                        });
                        addProposalAccounts(optionIndex, intendedAccounts as any);

                        clearBuilder?.();

                        navigate(returnTo);
                        return;
                    }

                    if (isProposalOptionCreateMode) {
                        await proposalOptionCreate.submit(payload);
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
