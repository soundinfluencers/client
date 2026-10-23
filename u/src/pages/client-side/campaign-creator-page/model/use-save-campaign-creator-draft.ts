import React from "react";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import {
    useCampaignBuilderStore,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store";
import {
    buildCampaignDraftPayload,
    hasDraftSelection,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/build-draft-payload";
import { getSavedDraftId } from "@/entities/client-side/campaign-draft/api/draft-save-result";
import { isInvalidOfferError } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/selected-offer";
import { CampaignDraftLatestStep } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.types";

type PostCampaignDraft = (payload: Record<string, unknown>) => Promise<unknown>;
type UpdateCampaignDraft = (payload: Record<string, unknown>) => Promise<unknown>;

type Params = {
    postCampaignDraft: PostCampaignDraft;
    updateCampaignDraft?: UpdateCampaignDraft;
};

export const useSaveCampaignCreatorDraft = ({
                                                postCampaignDraft,
                                                updateCampaignDraft,
                                            }: Params) => {
    const campaignName = useCampaignBuilderStore((s) => s.campaignName);
    const actions = useCampaignBuilderStore((s) => s.actions);
    const queryClient = useQueryClient();

    const [isOpen, setIsOpen] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);
    const inFlightRef = React.useRef(false);
    const [draftName, setDraftName] = React.useState("");

    const open = React.useCallback(() => {
        setDraftName(campaignName ?? "");
        setIsOpen(true);
    }, [campaignName]);

    const close = React.useCallback(() => {
        setIsOpen(false);
    }, []);

    const save = React.useCallback(async () => {
        if (inFlightRef.current) return;
        const state = useCampaignBuilderStore.getState();
        if (!hasDraftSelection(state)) {
            toast.error("Please select offer or promo cards before saving draft.");
            return;
        }

        if (!draftName.trim()) {
            toast.error("Draft name is required.");
            return;
        }

        inFlightRef.current = true;
        setIsSaving(true);
        try {
            const payload = buildCampaignDraftPayload(state, CampaignDraftLatestStep.addAccounts, {
                campaignName: draftName.trim(),
                draftId: state.draftId,
            });
            const response =
                state.draftId && updateCampaignDraft
                    ? await updateCampaignDraft(payload)
                    : await postCampaignDraft(payload);

            const newDraftId = getSavedDraftId(response, state.draftId);

            actions.setDraftMeta({
                draftId: newDraftId,
                draftStep: CampaignDraftLatestStep.addAccounts,
            });

            actions.setCampaignName(draftName.trim());

            await queryClient.invalidateQueries({
                queryKey: ["dashboard-campaigns"],
            });

            toast.success("Draft saved successfully!");
            close();
        } catch (error) {
            toast.error(isInvalidOfferError(error) ? "Your selected offer has changed or is unavailable. Refresh the catalogue and review your selection before saving again." : error instanceof Error ? error.message : "Failed to save draft");
        } finally {
            inFlightRef.current = false;
            setIsSaving(false);
        }
    }, [
        draftName,
        actions,
        close,
        postCampaignDraft,
        updateCampaignDraft,
        queryClient,
    ]);

    return {
        isOpen,
        isSaving,
        draftName,
        setDraftName,
        open,
        close,
        save,
    };
};
