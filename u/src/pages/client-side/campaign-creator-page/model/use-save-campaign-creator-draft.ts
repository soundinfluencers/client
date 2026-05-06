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
    const state = useCampaignBuilderStore();
    const actions = useCampaignBuilderStore((s) => s.actions);
    const queryClient = useQueryClient();

    const [isOpen, setIsOpen] = React.useState(false);
    const [draftName, setDraftName] = React.useState("");

    const open = React.useCallback(() => {
        setDraftName(state.campaignName ?? "");
        setIsOpen(true);
    }, [state.campaignName]);

    const close = React.useCallback(() => {
        setIsOpen(false);
    }, []);

    const save = React.useCallback(async () => {
        if (!hasDraftSelection(state)) {
            toast.error("Please select offer or promo cards before saving draft.");
            return;
        }

        if (!draftName.trim()) {
            toast.error("Draft name is required.");
            return;
        }

        const payload = buildCampaignDraftPayload(state, "addAccounts", {
            campaignName: draftName.trim(),
            draftId: state.draftId,
        });

        try {
            const response =
                state.draftId && updateCampaignDraft
                    ? await updateCampaignDraft(payload)
                    : await postCampaignDraft(payload);

            const maybeResponse = response as
                | { draftId?: string; _id?: string; data?: { draftId?: string; _id?: string } }
                | undefined;

            const newDraftId =
                maybeResponse?.draftId ||
                maybeResponse?._id ||
                maybeResponse?.data?.draftId ||
                maybeResponse?.data?._id ||
                state.draftId ||
                null;

            actions.setDraftMeta({
                draftId: newDraftId,
                draftStep: "addAccounts",
            });

            actions.setCampaignName(draftName.trim());

            await queryClient.invalidateQueries({
                queryKey: ["dashboard-campaigns"],
            });

            toast.success("Draft saved successfully!");
            close();
        } catch {
            toast.error("Failed to save draft");
        }
    }, [
        state,
        draftName,
        actions,
        close,
        postCampaignDraft,
        updateCampaignDraft,
        queryClient,
    ]);

    return {
        isOpen,
        draftName,
        setDraftName,
        open,
        close,
        save,
    };
};