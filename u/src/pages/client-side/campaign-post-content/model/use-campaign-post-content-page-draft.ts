import React from "react";
import { toast } from "react-toastify";

import {
    buildCampaignDraftPayload,
    buildCampaignDraftWorkflowValuesByAccountId,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/build-draft-payload";
import {
    useCampaignBuilderStore,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store";
import {
    CampaignDraftLatestStep,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.types";
import {
    postCampaignDraft,
} from "@/entities/client-side/campaign-draft/api/campaign-draft.api";
import {
    parseCampaignDraftError,
} from "@/entities/client-side/campaign-draft/model/campaign-draft.errors";
import type {
    BuiltCampaignPostContentPayload,
} from "@/widgets/client-side/campaign-post-content/model/campaign-post-content.types";

type Params = {
    buildPayload: () => BuiltCampaignPostContentPayload;
};

export const useCampaignPostContentPageDraft = ({
    buildPayload,
}: Params) => {
    const campaignName = useCampaignBuilderStore((state) => state.campaignName);
    const actions = useCampaignBuilderStore((state) => state.actions);

    const [draftModal, setDraftModal] = React.useState(false);
    const [draftName, setDraftName] = React.useState("");
    const [isSaving, setIsSaving] = React.useState(false);
    const inFlightRef = React.useRef(false);

    const openDraftModal = React.useCallback(() => {
        setDraftName(campaignName || "");
        setDraftModal(true);
    }, [campaignName]);

    const closeDraftModal = React.useCallback(() => {
        setDraftModal(false);
    }, []);

    const onSaveDraft = React.useCallback(async () => {
        if (inFlightRef.current) return;

        const nextCampaignName = draftName.trim() || campaignName || "";

        if (!nextCampaignName) {
            toast.error("Draft name is required");
            return;
        }

        inFlightRef.current = true;
        setIsSaving(true);

        try {
            const currentContentPayload = buildPayload();
            const state = useCampaignBuilderStore.getState();
            const workflowValuesByAccountId =
                buildCampaignDraftWorkflowValuesByAccountId(
                    currentContentPayload.addedAccounts,
                );
            const { payload, draftSelectionRows } =
                buildCampaignDraftPayload(state, {
                    campaignName: nextCampaignName,
                    step: CampaignDraftLatestStep.addContent,
                    campaignContent: currentContentPayload.campaignContent,
                    workflowValuesByAccountId,
                });

            actions.setDraftSelectionRows(draftSelectionRows);

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

            actions.setDraftMeta({
                draftId: result.draftId,
                draftStep: CampaignDraftLatestStep.addContent,
            });
            actions.setCampaignName(nextCampaignName);

            toast.success("Draft saved successfully");
            closeDraftModal();
        } catch (error) {
            toast.error(parseCampaignDraftError(error).message);
        } finally {
            inFlightRef.current = false;
            setIsSaving(false);
        }
    }, [actions, buildPayload, campaignName, closeDraftModal, draftName]);

    return {
        draftModal,
        draftName,
        isSaving,
        setDraftName,
        openDraftModal,
        closeDraftModal,
        onSaveDraft,
    };
};
