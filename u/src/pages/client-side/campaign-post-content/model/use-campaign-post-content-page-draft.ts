import React from "react";
import { serializeCampaignContent, serializeContentReference } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-content.transport";
import { currencyCode, getBuilderSelectedOffer, getDraftRowIds, isInvalidOfferError, serializeDraftSelection } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/selected-offer";
import { getSavedDraftId } from "@/entities/client-side/campaign-draft/api/draft-save-result";
import { toast } from "react-toastify";

import type {
    CampaignPostContentAccount,
    BuiltCampaignPostContentPayload,
} from "@/widgets/client-side/campaign-post-content/model/campaign-post-content.types";
import { useCampaignBuilderStore } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store";
import {
    postCampaignDraft,
    updateCampaignDraft,
} from "@/entities/client-side/campaign-draft/api/campaign-draft.api";
import {
    CampaignDraftLatestStep
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.types.ts";

type Params = {
    accounts: CampaignPostContentAccount[];
    campaignPrice: number;
    buildPayload: () => BuiltCampaignPostContentPayload;
};

export const useCampaignPostContentPageDraft = ({
                                                    buildPayload,
                                                }: Params) => {
    const campaignName = useCampaignBuilderStore((s) => s.campaignName);

    const [draftModal, setDraftModal] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);
    const inFlightRef = React.useRef(false);
    const [draftName, setDraftName] = React.useState("");

    const openDraftModal = React.useCallback(() => {
        setDraftName(campaignName || "");
        setDraftModal(true);
    }, [campaignName]);

    const closeDraftModal = React.useCallback(() => {
        setDraftModal(false);
    }, []);

    const onSaveDraft = React.useCallback(async () => {
        if (inFlightRef.current) return;
        inFlightRef.current = true;
        setIsSaving(true);
        try {
            const payload = buildPayload();
            const state = useCampaignBuilderStore.getState();
            const campaignContent = serializeCampaignContent(payload.campaignContent);
            const draftId = state.draftId;
            const nextCampaignName = draftName.trim() || state.campaignName || "";

            if (!nextCampaignName) {
                toast.error("Draft name is required");
                return;
            }

            const rows = payload.addedAccounts.filter((row) => state.selectedAccounts.some((account) =>
                row.selectionId ? account.selectionId === row.selectionId : account.accountId === row.socialAccountId)).map((row) => {
                const original = state.selectedAccounts.find((account) => row.selectionId
                    ? account.selectionId === row.selectionId : account.accountId === row.socialAccountId);
                return { ...row, ...getDraftRowIds(original ?? {}), selectedCampaignContentItem: serializeContentReference(row.selectedCampaignContentItem, campaignContent) };
            });
            const draftPayload = {
                draftId: draftId || undefined,
                step: CampaignDraftLatestStep.addContent,
                campaignName: nextCampaignName,
                socialMedia: payload.socialMedia,
                displayCurrency: currencyCode(state.selectedCurrency),
                ...serializeDraftSelection(rows, getBuilderSelectedOffer(state)),
                campaignContent,
            };
            const response = draftId
                ? await updateCampaignDraft(draftPayload)
                : await postCampaignDraft(draftPayload);


            const nextDraftId = getSavedDraftId(response, draftId);

            state.actions.setDraftMeta({
                draftId: nextDraftId,
                draftStep: CampaignDraftLatestStep.addContent,
            });

            toast.success("Draft saved successfully");
            closeDraftModal();
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Failed to save draft";

            toast.error(isInvalidOfferError(error) ? "Your selected offer has changed or is unavailable. Return to Edit selection and refresh the catalogue before saving again." : message);
        } finally {
            inFlightRef.current = false;
            setIsSaving(false);
        }
    }, [
        buildPayload,
        draftName,
        closeDraftModal,
    ]);

    return {
        draftModal,
        isSaving,
        draftName,
        setDraftName,
        openDraftModal,
        closeDraftModal,
        onSaveDraft,
    };
};
