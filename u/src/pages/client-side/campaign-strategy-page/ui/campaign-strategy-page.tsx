import React from "react";
import {Container, Breadcrumbs, ButtonMain, ButtonSecondary} from "@/components";
import { useNavigate } from "react-router-dom";

import { Modal } from "@components/ui/modal-fix/Modal";

import { useCampaignBuilderStore } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store";
import { groupCampaignStrategyData } from "../model/campaign-strategy.helpers";
import { CampaignStrategySection } from "@/widgets/client-side/campaign-tables/ui/campaign-strategy-section";

import styles from "./campaign-strategy-page.module.scss";
import {
    useCampaignStrategyViewParams,
} from "@/features/client-side/campaign-tables/model/use-campaign-strategy-view-params";
import { ViewChange } from "@/features/client-side/campaign-tables/view-change/ui/view-change";
import { ViewAudience } from "@/features/client-side/campaign-tables/view-audience/ui/view-audince";
import {
    buildStrategyProposalPayload,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-strategy.payload";
import { LiveViewCard } from "@/widgets/client-side/campaign-tables/ui/live-view-card/ui/live-view-card";
import {useSaveProposal} from "@/widgets/client-side/campaign-tables/model/use-save-proposal.ts";
import {useProposalShare} from "@/widgets/client-side/campaign-tables/model/use-proposal-share.ts";
import {Bar} from "@/widgets/client-side/campaign-tables/ui/bar-campaigns/ui/bar.tsx";
import {
    buildCampaignBarData
} from "@/widgets/client-side/campaign-tables/ui/bar-campaigns/model/campaign-strategy-bar.helpers.ts";
import {Checkbox} from "@/widgets/client-side/campaign-tables/ui/check-box-row/ui/checkbox.tsx";
import {postCampaignDraft} from "@/entities/client-side/campaign-draft/api/campaign-draft.api.ts";
import {toast} from "react-toastify";
import {DraftButton} from "@components/ui/draft-button/draft-button.tsx";
import {
    buildCampaignDraftPayload,
    buildCampaignDraftWorkflowValuesByAccountId,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/build-draft-payload";
import {
    CampaignDraftLatestStep,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.types";
import {
    parseCampaignDraftError,
} from "@/entities/client-side/campaign-draft/model/campaign-draft.errors";


export const CampaignStrategyPage = () => {
    const navigate = useNavigate();

    const campaignName = useCampaignBuilderStore((s) => s.campaignName);
    const accounts = useCampaignBuilderStore((s) => s.selectedAccounts);
    const content = useCampaignBuilderStore((s) => s.campaignContent);
    const totalPrice = useCampaignBuilderStore((s) => s.totalPrice);
    const selectedCurrency = useCampaignBuilderStore((s) => s.selectedCurrency);
    const selectionCurrency = useCampaignBuilderStore((s) => s.selectionCurrency);
    const selectedOfferId = useCampaignBuilderStore((s) => s.selectedOfferId);
    const selectedOfferAccountIds = useCampaignBuilderStore(
        (s) => s.selectedOfferAccountIds,
    );

    const reset = useCampaignBuilderStore((s) => s.actions.reset);
    const [checked, setChecked] = React.useState(true);
    const [isSavingDraft, setIsSavingDraft] = React.useState(false);
    const draftSaveInFlightRef = React.useRef(false);

    const setAccountDateRequest = useCampaignBuilderStore(
        (s) => s.actions.setAccountDateRequest,
    );

    const setSelectedCampaignContentItemRaw = useCampaignBuilderStore(
        (s) => s.actions.setSelectedCampaignContentItem,
    );

    const setSelectedCampaignContentItem = React.useCallback(
        (
            accountId: string,
            selected: { campaignContentItemId: string; descriptionId: string } | null,
        ) => {
            if (!selected) return;
            setSelectedCampaignContentItemRaw(accountId, selected);
        },
        [setSelectedCampaignContentItemRaw],
    );

    const { view, setView, insights, setInsights } =
        useCampaignStrategyViewParams({
            isProposal: false,
            tableOnly: true,
        });

    const grouped = React.useMemo(
        () =>
            groupCampaignStrategyData({
                accounts,
                items: content,
            }),
        [accounts, content],
    );

    React.useEffect(() => {
        if (!import.meta.env.DEV) return;

        const selectedAccountIds = accounts.map((account) => account.accountId);
        const groupedAccountIds = [
            ...grouped.mainCreator.accounts,
            ...grouped.mainCommunity.accounts,
            ...grouped.music.accounts,
            ...grouped.press.accounts,
        ].map((account) => account.accountId);
        const groupedAccountCounts = groupedAccountIds.reduce<Map<string, number>>(
            (counts, accountId) => {
                counts.set(accountId, (counts.get(accountId) ?? 0) + 1);
                return counts;
            },
            new Map(),
        );
        const missingAccountIds = selectedAccountIds.filter(
            (accountId) => !groupedAccountCounts.has(accountId),
        );
        const duplicateAccountIds = [
            ...groupedAccountCounts.entries(),
        ]
            .filter(([, count]) => count > 1)
            .map(([accountId]) => accountId);

        if (missingAccountIds.length || duplicateAccountIds.length) {
            console.warn("[Campaign Strategy account partition mismatch]", {
                selectedAccountIds,
                groupedAccountIds,
                missingAccountIds,
                duplicateAccountIds,
            });
        }
    }, [accounts, grouped]);

    const readonlyDateActions = React.useMemo(
        () => ({
            setAccountDateRequest,
            setAccountSelectedContent: setSelectedCampaignContentItem,
        }),
        [setAccountDateRequest, setSelectedCampaignContentItem],
    );

    const pageMode = React.useMemo(() => {
        if (view === -1) return "edit";
        if (view === 0) return "readonlyDate";
        return "readonly";
    }, [view]);

    const onSaveDraft = React.useCallback(async () => {
        if (draftSaveInFlightRef.current) return;

        const state = useCampaignBuilderStore.getState();
        const nextCampaignName = state.campaignName.trim();

        if (!nextCampaignName) {
            toast.error("Draft name is required");
            return;
        }

        draftSaveInFlightRef.current = true;
        setIsSavingDraft(true);

        try {
            const workflowValuesByAccountId =
                buildCampaignDraftWorkflowValuesByAccountId(
                    state.selectedAccounts,
                );
            const { payload, draftSelectionRows } =
                buildCampaignDraftPayload(state, {
                    campaignName: nextCampaignName,
                    step: CampaignDraftLatestStep.strategyTable,
                    campaignContent: state.campaignContent,
                    workflowValuesByAccountId,
                });

            state.actions.setDraftSelectionRows(draftSelectionRows);

            const expectedOperation = state.draftId ? "updated" : "created";
            const result = await postCampaignDraft(payload);

            if (
                import.meta.env.DEV &&
                result.operation !== expectedOperation
            ) {
                console.warn(
                    `Campaign Draft was ${result.operation}; expected ${expectedOperation}.`,
                );
            }

            state.actions.setDraftMeta({
                draftId: result.draftId,
                draftStep: CampaignDraftLatestStep.strategyTable,
            });

            toast.success("Draft saved successfully");
        } catch (error) {
            toast.error(parseCampaignDraftError(error).message);
        } finally {
            draftSaveInFlightRef.current = false;
            setIsSavingDraft(false);
        }
    }, []);

    const {
        isProposalModalOpen,
        campaignProposalId,
        setProposalModalOpen,
        saveProposal,
    } = useSaveProposal({
        campaignName,
        totalPrice,
        displayCurrency: selectionCurrency,
        accounts,
        content,
        selectedOfferId,
        selectedOfferAccountIds,
    });

    const {
        shareUrl,
        copyShareLink,
        openProposal,
    } = useProposalShare(campaignProposalId);

    const onProceed = React.useCallback(() => {
        const payload = selectionCurrency
            ? buildStrategyProposalPayload({
                campaignName,
                totalPrice,
                displayCurrency: selectionCurrency,
                accounts,
                content,
                selectedOfferId,
                selectedOfferAccountIds,
            })
            : null;

        console.log("STRATEGY PROPOSAL PAYLOAD", payload);
        console.log("strategy campaignName", campaignName);
        console.log("strategy accounts", accounts);
        console.log("strategy content", content);
        console.log("strategy totalPrice", totalPrice);
        navigate("/client/create-campaign/content/strategy/payment");
    }, [
        campaignName,
        totalPrice,
        selectionCurrency,
        accounts,
        content,
        selectedOfferId,
        selectedOfferAccountIds,
        navigate,
    ]);
    const barData = React.useMemo(
        () =>
            buildCampaignBarData({
                totalPrice,
                accounts,
                content,
                submittedAt: new Date(),
                currency: selectedCurrency,
            }),
        [totalPrice, accounts, content],
    );
    const getNetworksForContentItem = React.useCallback(
        (
            itemId: string,
            networks: typeof accounts,
        ) => {
            return networks.filter((account) => {
                const selectedId = account.selectedCampaignContentItem?.campaignContentItemId;

                return String(selectedId) === String(itemId);
            });
        },
        [],
    );
    return (
        <>
            <Container>
                <div className={styles.navMenu}>
                    <Breadcrumbs />
                    <DraftButton
                        onClick={onSaveDraft}
                        isDisabled={isSavingDraft}
                    />
                </div>

                <div className={styles.page}>
                    <div className={styles.header}>
                        <h1>{campaignName || "Campaign strategy"}</h1>
                        <Bar

                            submittedLabel={barData.submittedLabel}
                            budgetLabel={barData.budgetLabel}
                            reachLabel={barData.reachLabel}
                            postsLabel={barData.postsLabel}
                            videosLabel={barData.videosLabel}
                        />
                        <div className={styles.controls}>
                            <div className={styles.controlsContent}>
                                {view !== 1 && (
                                    <ViewAudience
                                        flag={insights}
                                        onChange={() => setInsights(!insights)}
                                    />
                                )}
                                <button
                                    type="button"
                                    className={styles.controlsProposal}
                                    onClick={saveProposal}
                                >
                                    Save proposal
                                </button>
                            </div>
                            <ViewChange
                                view={view}
                                setView={setView}
                                isProposal={false}
                                tableOnly
                            />


                        </div>
                    </div>

                    {view === 0 ? (
                        <div className={styles.pageContent}>
                            {!!grouped.mainCreator.accounts.length && (
                                <CampaignStrategySection
                                    title={grouped.mainCreator.title}
                                    group="main"
                                    mode={pageMode}
                                    accounts={grouped.mainCreator.accounts}
                                    items={grouped.mainCreator.items}
                                    totalPrice={totalPrice}
                                    actions={pageMode !== "readonly" ? readonlyDateActions : undefined}
                                    insights={insights}
                                    currency={selectedCurrency}
                                />
                            )}

                            {!!grouped.mainCommunity.accounts.length && (
                                <CampaignStrategySection
                                    title={grouped.mainCommunity.title}
                                    group="main"
                                    mode={pageMode}
                                    accounts={grouped.mainCommunity.accounts}
                                    items={grouped.mainCommunity.items}
                                    totalPrice={totalPrice}
                                    actions={pageMode !== "readonly" ? readonlyDateActions : undefined}
                                    insights={insights}
                                    currency={selectedCurrency}

                                />
                            )}

                            {!!grouped.music.accounts.length && (
                                <CampaignStrategySection
                                    title={grouped.music.title}
                                    group="music"
                                    mode={pageMode}
                                    accounts={grouped.music.accounts}
                                    items={grouped.music.items}
                                    totalPrice={totalPrice}
                                    actions={pageMode !== "readonly" ? readonlyDateActions : undefined}
                                    insights={insights}
                                    currency={selectedCurrency}

                                />
                            )}

                            {!!grouped.press.accounts.length && (
                                <CampaignStrategySection
                                    title={grouped.press.title}
                                    group="press"
                                    mode={pageMode}
                                    accounts={grouped.press.accounts}
                                    items={grouped.press.items}
                                    totalPrice={totalPrice}
                                    actions={pageMode !== "readonly" ? readonlyDateActions : undefined}
                                    insights={insights}
                                    currency={selectedCurrency}


                                />
                            )}
                        </div>
                    ) : (
                        <div className={styles.pageContentCards}>
                            {!!grouped.mainCreator.items.length &&
                                grouped.mainCreator.items.map((item) => {
                                    const networks = getNetworksForContentItem(
                                        String(item._id),
                                        grouped.mainCreator.accounts,
                                    );

                                    if (!networks.length) return null;

                                    return (
                                        <LiveViewCard
                                            key={item._id}
                                            item={item}
                                            networks={networks}
                                            canEdit={pageMode === "edit"}
                                        />
                                    );
                                })}

                            {!!grouped.mainCommunity.items.length &&
                                grouped.mainCommunity.items.map((item) => {
                                    const networks = getNetworksForContentItem(
                                        String(item._id),
                                        grouped.mainCommunity.accounts,
                                    );

                                    if (!networks.length) return null;

                                    return (
                                        <LiveViewCard
                                            key={item._id}
                                            item={item}
                                            networks={networks}
                                            canEdit={pageMode === "edit"}
                                        />
                                    );
                                })}

                            {!!grouped.music.items.length &&
                                grouped.music.items.map((item) => {
                                    const networks = getNetworksForContentItem(
                                        String(item._id),
                                        grouped.music.accounts,
                                    );

                                    if (!networks.length) return null;

                                    return (
                                        <LiveViewCard
                                            key={item._id}
                                            item={item}
                                            networks={networks}
                                            canEdit={pageMode === "edit"}
                                        />
                                    );
                                })}

                            {!!grouped.press.items.length &&
                                grouped.press.items.map((item) => {
                                    const networks = getNetworksForContentItem(
                                        String(item._id),
                                        grouped.press.accounts,
                                    );

                                    if (!networks.length) return null;

                                    return (
                                        <LiveViewCard
                                            key={item._id}
                                            item={item}
                                            networks={networks}
                                            canEdit={pageMode === "edit"}
                                        />
                                    );
                                })}
                        </div>
                    )}

                    <div className={styles.footerActions}>

                        <Checkbox
                            name="Allow automatic influencer replacement if a creator opts out."
                            isChecked={checked}
                            onChange={setChecked}
                        />
                        <ButtonMain
                            className={styles.proceedButton}
                            onClick={onProceed} text={"Proceed"}                        />

                    </div>
                </div>
            </Container>

            {isProposalModalOpen && (
                <Modal className={styles.proposalModal} isShowCloseButton={false}
                    onClose={() => {
                        setProposalModalOpen(false);
                        navigate("/client");
                        reset();
                    }}
                >
                    <h2>Proposal saved</h2>

                    <input
                        type="text"
                        value={shareUrl}
                        readOnly
                        placeholder="https://go.soundinfluencers.com//promo-share/..."
                    />

                    <div className={styles.proposalModalButtons}>
                        <ButtonSecondary
                            text='Copy share link'
                            className={styles.proceedButtonProposal}
                            onClick={copyShareLink}
                        />



                        <ButtonMain
                            text='Edit proposal'
                            className={styles.proceedButtonProposal}
                            onClick={openProposal}
                        />


                    </div>
                </Modal>
            )}
        </>
    );
};
