import React from "react";

import { useCampaignPage } from "../model/use-campaign-page";
import { CampaignBar } from "@/widgets/client-side/campaign/campaign-bar/ui/campaign-bar.tsx";
import { Container } from "@/shared/ui/container/container.tsx";

import { CampaignTableSection } from "@/widgets/client-side/campaign/campaign-table/ui/campaign-table-section";
import { groupEditableCampaignData } from "@/widgets/client-side/campaign/campaign-table/model/campaign-table.helpers";

import { useCampaignViewParams } from "@/features/client-side/campaign/campaign-view/model/use-campaign-view-params";
import { ToggleCampaignMode } from "@/features/client-side/campaign/campaign-view/ui/toggle-campaign-mode";
import { ViewChange } from "@/features/client-side/campaign/campaign-view/ui/view-change";
import { AdvancedInsightsToggle } from "@/features/client-side/campaign/campaign-view/ui/advanced-insights-toggle.tsx";

import { ShareCampaignLinkButton } from "@/features/client-side/campaign/share-campaign-link/ui/share-campaign-link-button.tsx";

import { useProposalOptions } from "@/features/client-side/campaign/proposal-options/model/use-proposal-options";
import { OptionsSlider } from "@/features/client-side/campaign/proposal-options/ui/options-slider";
import { AdditionalOption } from "@/features/client-side/campaign/proposal-options/ui/additional-option";

import { CampaignFilesButtons } from "@/features/client-side/campaign/campaign-files/ui/campaign-files-buttons";

import { useCampaignStore } from "@/entities/client-side/campaign/store/campaign.store";

import check from "@/assets/icons/check-circle.svg";

import styles from "./campaign.module.scss";

const normalizeStatus = (status: unknown) => {
    return String(status ?? "").trim().toLowerCase();
};

export const Campaign = () => {
    const { editable, activeOptionIndex, isLoading, isError, reload } =
        useCampaignPage();

    const original = useCampaignStore((s) => s.original);
    const currentEditable = useCampaignStore((s) => s.editable);
    const buildSavePayload = useCampaignStore((s) => s.buildSavePayload);

    const canEdit = editable?.kind === "proposal" && Boolean(editable?.canEdit);
    const canManageAccounts = canEdit;
    const isProposal = editable?.kind === "proposal";

    const status = normalizeStatus(editable?.status);

    const isUnderReview = status === "under_review";
    const isDistributing = status === "distributing";
    const isCompleted = status === "completed" || status === "closed";

    const canShowFiles = isCompleted && !isProposal;

    const hasChanges = React.useMemo(() => {
        if (!isProposal || !original || !currentEditable) return false;

        return JSON.stringify(original) !== JSON.stringify(currentEditable);
    }, [isProposal, original, currentEditable]);

    const handleSaveProposal = React.useCallback(async () => {
        if (!hasChanges) return;

        const payload = buildSavePayload();

        if (!payload) return;

        console.log("proposal save payload", payload);

        // TODO: сюда подключишь endpoint сохранения proposal
        // await saveProposalCampaign(editable.campaignId, activeOptionIndex ?? 0, payload);
    }, [hasChanges, buildSavePayload]);

    const {
        optionIndexes,
        activeOptionIndex: proposalActiveOptionIndex,
        isCreating,
        isDeleting,
        isSwitching,
        createOption,
        deleteOption,
        switchOption,
    } = useProposalOptions();

    const {
        mode,
        view,
        isAdvancedInsights,
        setView,
        toggleMode,
        toggleAdvancedInsights,
    } = useCampaignViewParams({
        kind: editable?.kind,
        canEdit,
    });

    const isEditView = view === -1;

    const tableCanEdit = Boolean(canEdit && isEditView);
    const tableCanManageAccounts = Boolean(canManageAccounts && isEditView);

    const isProposalOptionsPending = isCreating || isDeleting || isSwitching;

    const grouped = React.useMemo(() => {
        if (!editable) return null;

        return groupEditableCampaignData({
            accounts: editable.addedAccounts,
            items: editable.campaignContent,
        });
    }, [editable]);

    if (isLoading) {
        return <div>Loading campaign...</div>;
    }

    if (isError || !editable || !grouped) {
        return (
            <div>
                <p>Failed to load campaign</p>
                <button type="button" onClick={reload}>
                    Retry
                </button>
            </div>
        );
    }

    return (
        <Container className={styles.container}>
            <div className={styles.headerRow}>
                <h1>{editable.campaignName}</h1>

                {isProposal && (
                    <button
                        type="button"
                        onClick={handleSaveProposal}
                        disabled={!hasChanges}
                        className={`${styles.saveButton} ${
                            hasChanges ? styles.saveButtonActive : ""
                        }`}
                    >
                        <img src={check} alt="" />
                        Save
                    </button>
                )}
            </div>

            {editable.status !== "under_review" && !isProposal && (
                <h2>
                    Status: <span>{editable.status}</span>
                </h2>
            )}

            <CampaignBar campaign={editable} />

            {isProposal && (
                <div className={styles.proposalOptions}>
                    <AdditionalOption
                        onClick={createOption}
                        isPending={isCreating}
                    />

                    <OptionsSlider
                        optionIndexes={optionIndexes}
                        activeOption={proposalActiveOptionIndex}
                        onClickOption={switchOption}
                        onDeleteOption={deleteOption}
                        isPending={isProposalOptionsPending}
                    />
                </div>
            )}

            <div
                className={`${styles.controls} ${
                    isUnderReview ? styles.controlsUnderReview : ""
                } ${isDistributing ? styles.controlsDistributing : ""} ${
                    isCompleted ? styles.controlsCompleted : ""
                } ${isProposal ? styles.controlsProposal : ""}`}
            >
                <div className={styles.controlsLeft}>
                    {!isProposal && !isUnderReview && (
                        <ToggleCampaignMode mode={mode} onChange={toggleMode} />
                    )}

                    {mode === "strategy" && !isUnderReview && (
                        <AdvancedInsightsToggle
                            isActive={isAdvancedInsights}
                            onChange={toggleAdvancedInsights}
                        />
                    )}
                </div>

                <div className={styles.controlsRight}>
                    <ViewChange
                        view={view}
                        setView={setView}
                        isProposal={isProposal}
                        canEdit={canEdit}
                    />

                    {canShowFiles && (
                        <CampaignFilesButtons
                            campaignId={editable.campaignId}
                            campaignName={editable.campaignName}
                        />
                    )}

                    <ShareCampaignLinkButton
                        campaignId={editable.campaignId}
                        socialMedia={editable.socialMedia}
                        shareLink={editable.shareLink}
                        kind={editable.kind}
                    />
                </div>
            </div>

            <CampaignTableSection
                mode={mode}
                view={view}
                isAdvancedInsights={isAdvancedInsights}
                title={grouped.mainCreator.title}
                group={grouped.mainCreator.group}
                accounts={grouped.mainCreator.accounts}
                items={grouped.mainCreator.items}
                canEdit={tableCanEdit}
                canManageAccounts={tableCanManageAccounts}
                optionIndex={activeOptionIndex ?? 0}
                currency={editable.displayCurrency}
                totalPrice={editable.price}
                isProposal={isProposal}
            />

            <CampaignTableSection
                mode={mode}
                view={view}
                isAdvancedInsights={isAdvancedInsights}
                title={grouped.mainCommunity.title}
                group={grouped.mainCommunity.group}
                accounts={grouped.mainCommunity.accounts}
                items={grouped.mainCommunity.items}
                canEdit={tableCanEdit}
                canManageAccounts={tableCanManageAccounts}
                optionIndex={activeOptionIndex ?? 0}
                currency={editable.displayCurrency}
                totalPrice={editable.price}
                isProposal={isProposal}
            />

            <CampaignTableSection
                mode={mode}
                view={view}
                isAdvancedInsights={isAdvancedInsights}
                title={grouped.music.title}
                group={grouped.music.group}
                accounts={grouped.music.accounts}
                items={grouped.music.items}
                canEdit={tableCanEdit}
                canManageAccounts={tableCanManageAccounts}
                optionIndex={activeOptionIndex ?? 0}
                currency={editable.displayCurrency}
                totalPrice={editable.price}
                isProposal={isProposal}
            />

            <CampaignTableSection
                mode={mode}
                view={view}
                isAdvancedInsights={isAdvancedInsights}
                title={grouped.press.title}
                group={grouped.press.group}
                accounts={grouped.press.accounts}
                items={grouped.press.items}
                canEdit={tableCanEdit}
                canManageAccounts={tableCanManageAccounts}
                optionIndex={activeOptionIndex ?? 0}
                currency={editable.displayCurrency}
                totalPrice={editable.price}
                isProposal={isProposal}
            />
        </Container>
    );
};