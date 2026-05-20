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
    buildStrategyDraftPayload,
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


export const CampaignStrategyPage = () => {
    const navigate = useNavigate();

    const campaignName = useCampaignBuilderStore((s) => s.campaignName);
    const accounts = useCampaignBuilderStore((s) => s.selectedAccounts);
    const content = useCampaignBuilderStore((s) => s.campaignContent);
    const totalPrice = useCampaignBuilderStore((s) => s.totalPrice);
    const draftId = useCampaignBuilderStore((s) => s.draftId);
    const reset = useCampaignBuilderStore((s) => s.actions.reset);
    const [checked, setChecked] = React.useState(true);

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

    const pageMode = React.useMemo(() => {
        if (view === -1) return "edit";
        if (view === 0) return "readonlyDate";
        return "readonly";
    }, [view]);

    const onSaveDraft = React.useCallback(async () => {
        const payload = buildStrategyDraftPayload({
            campaignName,
            draftId,
            accounts,
            content,
        });

        console.log("SAVE STRATEGY DRAFT", payload);
        await postCampaignDraft(payload);
        toast.success("Draft saved successfully");
    }, [campaignName, draftId, accounts, content]);

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
        navigate("/client/create-campaign/content/strategy/payment");
    }, [campaignName, totalPrice, accounts, content, navigate]);
    const barData = React.useMemo(
        () =>
            buildCampaignBarData({
                totalPrice,
                accounts,
                content,
                submittedAt: new Date(),
            }),
        [totalPrice, accounts, content],
    );
    return (
        <>
            <Container>
                <div className={styles.navMenu}>
                    <Breadcrumbs />
                    <DraftButton onClick={onSaveDraft} />
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
                                />
                            )}
                        </div>
                    ) : (
                        <div className={styles.pageContentCards}>
                            {!!grouped.mainCreator.items.length &&
                                grouped.mainCreator.items.map((item) => (
                                    <LiveViewCard
                                        key={item._id}
                                        item={item}
                                        networks={grouped.mainCreator.accounts}
                                        canEdit={pageMode === "edit"}
                                    />
                                ))}

                            {!!grouped.mainCommunity.items.length &&
                                grouped.mainCommunity.items.map((item) => (
                                    <LiveViewCard
                                        key={item._id}
                                        item={item}
                                        networks={grouped.mainCommunity.accounts}
                                        canEdit={pageMode === "edit"}
                                    />
                                ))}

                            {!!grouped.music.items.length &&
                                grouped.music.items.map((item) => (
                                    <LiveViewCard
                                        key={item._id}
                                        item={item}
                                        networks={grouped.music.accounts}
                                        canEdit={pageMode === "edit"}
                                    />
                                ))}

                            {!!grouped.press.items.length &&
                                grouped.press.items.map((item) => (
                                    <LiveViewCard
                                        key={item._id}
                                        item={item}
                                        networks={grouped.press.accounts}
                                        canEdit={pageMode === "edit"}
                                    />
                                ))}
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
                <Modal isShowCloseButton={false}
                    onClose={() => {
                        setProposalModalOpen(false);
                        navigate("/client");
                        reset();
                    }}
                >
                    <div className={styles.proposalModal}>
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
                    </div>
                </Modal>
            )}
        </>
    );
};