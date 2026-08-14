import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import {
    postCampaignDraft,
} from "@/entities/client-side/campaign-draft/api/campaign-draft.api";
import {
    buildCampaignDraftPayload,
    hasDraftSelection,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/build-draft-payload";
import {
    useCampaignBuilderStore,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store";
import {
    CampaignDraftLatestStep,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.types";
import {
    parseCampaignDraftError,
} from "@/entities/client-side/campaign-draft/model/campaign-draft.errors";

export const useSaveCampaignCreatorDraft = () => {
    const campaignName = useCampaignBuilderStore((state) => state.campaignName);
    const actions = useCampaignBuilderStore((state) => state.actions);
    const queryClient = useQueryClient();

    const [isOpen, setIsOpen] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);
    const [draftName, setDraftName] = React.useState("");
    const inFlightRef = React.useRef(false);

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
        const nextCampaignName = draftName.trim();

        if (!hasDraftSelection(state)) {
            toast.error("Please select offer or promo cards before saving draft.");
            return;
        }

        if (!nextCampaignName) {
            toast.error("Draft name is required.");
            return;
        }

        if (!state.selectionCurrency) {
            toast.error("Campaign currency is required to save draft.");
            return;
        }

        inFlightRef.current = true;
        setIsSaving(true);

        try {
            const { payload, draftSelectionRows } =
                buildCampaignDraftPayload(state, {
                    campaignName: nextCampaignName,
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
                draftStep: CampaignDraftLatestStep.addAccounts,
            });
            actions.setCampaignName(nextCampaignName);

            await queryClient.invalidateQueries({
                queryKey: ["dashboard-campaigns"],
            });

            toast.success("Draft saved successfully!");
            close();
        } catch (error) {
            toast.error(parseCampaignDraftError(error).message);
        } finally {
            inFlightRef.current = false;
            setIsSaving(false);
        }
    }, [actions, close, draftName, queryClient]);

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
