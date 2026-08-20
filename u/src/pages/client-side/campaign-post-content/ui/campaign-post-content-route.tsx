import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { CampaignPostContentPage } from "@/widgets/client-side/campaign-post-content/ui/campaign-post-content-page.tsx";
import styles from "./campaign-post-content.module.scss";

import { useCampaignBuilderStore } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store.ts";
import { useProposalAccountsStore } from "@/client-side/store";

import { Breadcrumbs, Container, Loader } from "@/components";
import {
    buildProposalAccountsAfterSubmit,
} from "@/pages/client-side/campaign-post-content/model/build-proposal-accounts.ts";
import {
    CAMPAIGN_CURRENCY_OPTIONS,
} from "@/features/client-side/campaign-creator-page/build-campaign-filters/build-campaign-params.constants";
import {
    mapSelectedBundlesToPostContentSummaries,
} from "@/widgets/client-side/campaign-post-content/model/campaign-post-content-selection.mappers";
import {
    buildProposalAddInfluencerUrl,
    isProposalOptionCreateRequested,
    parseProposalOptionCreateContext,
    PROPOSAL_OPTION_CREATE_MODE,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder-navigation";
import {
    useCreateProposalOptionFromBuilder,
} from "@/pages/client-side/campaign-post-content/model/use-create-proposal-option-from-builder";
import {
    reconcileProposalAccountsFromBuilder,
    snapshotCampaignBuilderWorkingState,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/proposal-add-influencer-builder";
import {
    initializeNewProposalAccountContentSelections,
} from "@/client-side/widgets/campaign/model/proposal-content-selection";

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
    const commitBuilderWorkingOption = useProposalAccountsStore(
        (s) => s.commitBuilderWorkingOption,
    );

    const selectedAccounts = useCampaignBuilderStore((s) => s.selectedAccounts);
    const selectedBundles = useCampaignBuilderStore((s) => s.selectedBundles);
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
                prices: item.prices ? { ...item.prices } : undefined,

                dateRequest: item.dateRequest ?? "ASAP",
                selectedContent: item.selectedCampaignContentItem ?? null,
                selectedCampaignContentItem:
                    item.selectedCampaignContentItem ?? null,
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

    const rawAccountsForPage = React.useMemo(() => {
        return mappedAccounts;
    }, [mappedAccounts]);

    const selectedGroups = React.useMemo(
        () => getGroupsFromAccounts(rawAccountsForPage),
        [rawAccountsForPage],
    );

    const workingContent = React.useMemo(
        () =>
            proposalContent.filter((item) =>
                selectedGroups.has(item.socialMediaGroup as GroupKey),
            ),
        [proposalContent, selectedGroups],
    );

    const initializedAccounts = React.useMemo(
        () => isAddInfluencerMode
            ? initializeNewProposalAccountContentSelections({
                accounts: rawAccountsForPage,
                currentAccounts: proposalAccounts,
                contentItems: workingContent,
            })
            : {
                accounts: rawAccountsForPage,
                unresolvedNewAccountGroups: [] as GroupKey[],
            },
        [
            isAddInfluencerMode,
            rawAccountsForPage,
            proposalAccounts,
            workingContent,
        ],
    );
    const accountsForPage = initializedAccounts.accounts;

    const existingGroups = React.useMemo(
        () => getGroupsFromContent(workingContent),
        [workingContent],
    );

    const missingGroups = React.useMemo(() => {
        const result = new Set<GroupKey>(
            initializedAccounts.unresolvedNewAccountGroups,
        );

        selectedGroups.forEach((group) => {
            if (!existingGroups.has(group)) {
                result.add(group);
            }
        });

        return [...result];
    }, [selectedGroups, existingGroups, initializedAccounts]);

    const commitAddInfluencerWorkingOption = React.useCallback(
        ({
            preparedAccounts,
            nextContent,
        }: {
            preparedAccounts: any[];
            nextContent: any[];
        }) => {
            const preparedBySocialId = new Map(
                preparedAccounts.map((account) => [
                    String(account.socialAccountId ?? account.accountId ?? ""),
                    account,
                ] as const),
            );
            const builder = useCampaignBuilderStore.getState();
            const selectedAccountsWithContent = builder.selectedAccounts.map(
                (account) => {
                    const prepared = preparedBySocialId.get(account.accountId);

                    return prepared
                        ? {
                            ...account,
                            dateRequest:
                                prepared.dateRequest ??
                                account.dateRequest ??
                                "ASAP",
                            selectedCampaignContentItem:
                                prepared.selectedCampaignContentItem ??
                                prepared.selectedContent ??
                                account.selectedCampaignContentItem ??
                                null,
                        }
                        : account;
                },
            );

            builder.actions.setSelectedAccounts(selectedAccountsWithContent);
            builder.actions.setCampaignContent(nextContent as any);

            const latestBuilder = useCampaignBuilderStore.getState();
            const intendedAccounts = reconcileProposalAccountsFromBuilder({
                builderAccounts: latestBuilder.selectedAccounts,
                currentAccounts: proposalAccounts as any[],
            });
            const selectedOfferId = latestBuilder.selectedOfferId;
            const selectedOffer = selectedOfferId
                ? (() => {
                    const selectedAccountIds = [
                        ...latestBuilder.selectedOfferAccountIds,
                    ];
                    const intendedBySocialId = new Map(
                        intendedAccounts.map((account) => [
                            String(
                                account.socialAccountId ??
                                account.accountId ??
                                "",
                            ),
                            account,
                        ] as const),
                    );
                    const selectedAddedAccountsIds = selectedAccountIds
                        .map((accountId) =>
                            String(
                                intendedBySocialId.get(accountId)
                                    ?.addedAccountsId ?? "",
                            ),
                        )
                        .filter(Boolean);

                    return {
                        offerId: selectedOfferId,
                        selectedAccountIds,
                        ...(selectedAddedAccountsIds.length ===
                            selectedAccountIds.length
                            ? { selectedAddedAccountsIds }
                            : {}),
                    };
                })()
                : null;

            commitBuilderWorkingOption(optionIndex, {
                accounts: intendedAccounts as any,
                content: nextContent as any,
                bundles: Object.fromEntries(
                    latestBuilder.selectedBundles.map((bundle) => [
                        bundle.bundleId,
                        bundle.accounts.map((account) => account.accountId),
                    ]),
                ),
                selectedOffer,
                builderState: snapshotCampaignBuilderWorkingState(
                    latestBuilder,
                ),
                catalogContext: {
                    platform: searchParams.get("platform") ?? undefined,
                    genre: searchParams.get("genre") ?? undefined,
                },
            });
        },
        [
            commitBuilderWorkingOption,
            optionIndex,
            proposalAccounts,
            searchParams,
        ],
    );

    React.useEffect(() => {
        if (!isAddInfluencerMode) return;
        if (committedProposalAddKeyRef.current === proposalAddKey) return;

        if (!proposalSnapshot) {
            navigate(returnTo);
            return;
        }

        if (!accountsForPage.length) {
            return;
        }

        if (missingGroups.length > 0) return;

        committedProposalAddKeyRef.current = proposalAddKey;
        commitAddInfluencerWorkingOption({
            preparedAccounts: accountsForPage,
            nextContent: workingContent,
        });

        clearBuilder?.();

        navigate(returnTo);
    }, [
        isAddInfluencerMode,
        proposalSnapshot,
        accountsForPage,
        workingContent,
        missingGroups.length,
        commitAddInfluencerWorkingOption,
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
                    isAddInfluencerMode ? workingContent : campaignContent
                }
                accounts={accountsForPage}
                offerAccounts={offerAccounts}
                bundles={bundleSummaries}
                manualAccounts={manualAccounts}
                offerName={selectedOfferName}
                totalPrice={totalPrice}
                offerPrice={offerPrice}
                defaultCampaignName={campaignName}
                defaultBlocks={blocksDraft ?? undefined}
                currency={selectedCurrency}
                editSelectionUrl={
                    isAddInfluencerMode && selectedCurrencyCode
                        ? buildProposalAddInfluencerUrl({
                            optionIndex,
                            currency: selectedCurrencyCode,
                            platform: searchParams.get("platform") ?? undefined,
                            genre: searchParams.get("genre") ?? undefined,
                        })
                        : undefined
                }
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
                        : isAddInfluencerMode
                            ? "Proceed"
                            : "Continue"
                }
                onSubmitPayload={async (payload) => {
                    if (isAddInfluencerMode) {
                        if (committedProposalAddKeyRef.current === proposalAddKey) {
                            return;
                        }
                        committedProposalAddKeyRef.current = proposalAddKey;

                        const preparedAccounts = buildProposalAccountsAfterSubmit({
                            sourceAccounts: accountsForPage,
                            payloadAccounts: payload.addedAccounts,
                            mergedContent: payload.campaignContent,
                        });
                        commitAddInfluencerWorkingOption({
                            preparedAccounts,
                            nextContent: payload.campaignContent,
                        });

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
