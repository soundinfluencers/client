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
import { ViewAudience } from "@/features/client-side/campaign-tables/view-audience/ui/view-audince";
import {
    buildStrategyDraftPayload,
    buildStrategyProposalPayload,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-strategy.payload";
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
import { getBuilderSelectedOffer, isInvalidOfferError } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/selected-offer";
import { getSavedDraftId } from "@/entities/client-side/campaign-draft/api/draft-save-result";
import { CampaignDraftLatestStep } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.types";


export const CampaignStrategyPage = () => {
    const navigate = useNavigate();

    const campaignName = useCampaignBuilderStore((s) => s.campaignName);
    const offerAvailable = useCampaignBuilderStore((s) => s.selectedOfferIsAvailable);
    const totalPriceReady = useCampaignBuilderStore((s) => s.totalPriceReady);
    const accounts = useCampaignBuilderStore((s) => s.selectedAccounts);
    const content = useCampaignBuilderStore((s) => s.campaignContent);
    const totalPrice = useCampaignBuilderStore((s) => s.totalPrice);
    const selectedCurrency = useCampaignBuilderStore((s) => s.selectedCurrency);

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
            selected: { campaignContentItemId: string; descriptionId: string | null; additionalBriefId?: string | null } | null,
        ) => {
            if (!selected) return;
            setSelectedCampaignContentItemRaw(accountId, selected);
        },
        [setSelectedCampaignContentItemRaw],
    );

    const { insights, setInsights } =
        useCampaignStrategyViewParams({ isProposal: false });

    const grouped = React.useMemo(
        () =>
            groupCampaignStrategyData({
                accounts,
                items: content,
            }),
        [accounts, content],
    );

    const readonlyDateActions = React.useMemo(
        () => ({
            setAccountDateRequest,
            setAccountSelectedContent: setSelectedCampaignContentItem,
        }),
        [setAccountDateRequest, setSelectedCampaignContentItem],
    );

    // Creation Strategy is table-only, even for persisted/legacy ?view=1 links.
    const pageMode = "readonlyDate" as const;

    const onSaveDraft = React.useCallback(async () => {
        if (draftSaveInFlightRef.current) return;
        draftSaveInFlightRef.current = true;
        setIsSavingDraft(true);
        try {
            const state = useCampaignBuilderStore.getState();
            const payload = buildStrategyDraftPayload({
                campaignName: state.campaignName,
                draftId: state.draftId,
                accounts: state.selectedAccounts,
                content: state.campaignContent,
                selectedOffer: getBuilderSelectedOffer(state),
                displayCurrency: state.selectedCurrency,
            });
            const response = await postCampaignDraft(payload);
            state.actions.setDraftMeta({ draftId: getSavedDraftId(response, state.draftId), draftStep: CampaignDraftLatestStep.strategyTable });
            toast.success("Draft saved successfully");
        } catch (error) {
            toast.error(isInvalidOfferError(error) ? "Your selected offer has changed or is unavailable. Return to the offer selection and refresh the catalogue before saving again." : error instanceof Error ? error.message : "Failed to save draft");
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
        accounts,
        content,
    });

    const {
        shareUrl,
        copyShareLink,
        openProposal,
    } = useProposalShare(campaignProposalId);

    const onProceed = React.useCallback(() => {
        if (!useCampaignBuilderStore.getState().totalPriceReady) return;
        const payload = buildStrategyProposalPayload({
            campaignName,
            totalPrice,
            accounts,
            content,
        });

        console.log("STRATEGY PROPOSAL PAYLOAD", payload);
        console.log("strategy campaignName", campaignName);
        console.log("strategy accounts", accounts);
        console.log("strategy content", content);
        console.log("strategy totalPrice", totalPrice);
        navigate(`/client/create-campaign/content/strategy/payment?currency=${selectedCurrency === "$" ? "USD" : selectedCurrency === "£" ? "GBP" : "EUR"}`);
    }, [campaignName, totalPrice, accounts, content, navigate, selectedCurrency]);
    const barData = React.useMemo(
        () =>
            buildCampaignBarData({
                totalPrice,
                accounts,
                content,
                submittedAt: new Date(),
                currency: selectedCurrency,
            }),
        [totalPrice, accounts, content, selectedCurrency],
    );
    const ambiguous = accounts.filter((a, index) => accounts.findIndex((b) => b.accountId === a.accountId) !== index);
    if (ambiguous.length) return <Container><p role="alert">This draft contains ambiguous account selections. Review the individual rows before checkout; no content or rows have been removed.</p>
        <button type="button" onClick={() => navigate(`/client/create-campaign/content?currency=${selectedCurrency === "$" ? "USD" : selectedCurrency === "£" ? "GBP" : "EUR"}`)}>Review saved selections</button>
    </Container>;
    return (
        <>
            <Container>
                <div className={styles.navMenu}>
                    <Breadcrumbs />
                    <DraftButton onClick={onSaveDraft} isDisabled={isSavingDraft} />
                </div>

                <div className={styles.page}>
                    <div className={styles.header}>
                        <h1>{campaignName || "Campaign strategy"}</h1>
                        <Bar

                            submittedLabel={barData.submittedLabel}
                            budgetLabel={offerAvailable === false ? "Offer unavailable — review selection" : !totalPriceReady ? "Prices unavailable for the selected currency" : barData.budgetLabel}
                            reachLabel={barData.reachLabel}
                            postsLabel={barData.postsLabel}
                            videosLabel={barData.videosLabel}
                        />
                        <div className={styles.controls}>
                            <div className={styles.controlsContent}>
                                    <ViewAudience
                                        flag={insights}
                                        onChange={() => setInsights(!insights)}
                                    />
                                <button
                                    type="button"
                                    className={styles.controlsProposal}
                                    onClick={saveProposal}
                                >
                                    Save proposal
                                </button>
                            </div>


                        </div>
                    </div>

                        <div className={styles.pageContent}>
                            {!!grouped.mainCreator.accounts.length && (
                                <CampaignStrategySection
                                    title={grouped.mainCreator.title}
                                    group="main"
                                    mode={pageMode}
                                    accounts={grouped.mainCreator.accounts}
                                    items={grouped.mainCreator.items}
                                    totalPrice={totalPrice}
                                    actions={readonlyDateActions}
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
                                    actions={readonlyDateActions}
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
                                    actions={readonlyDateActions}
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
                                    actions={readonlyDateActions}
                                    insights={insights}
                                    currency={selectedCurrency}


                                />
                            )}
                        </div>

                    <div className={styles.footerActions}>

                        <Checkbox
                            name="Allow automatic influencer replacement if a creator opts out."
                            isChecked={checked}
                            onChange={setChecked}
                        />
                        <ButtonMain
                            className={styles.proceedButton}
                            onClick={onProceed} text={"Proceed"} isDisabled={!totalPriceReady} />

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
