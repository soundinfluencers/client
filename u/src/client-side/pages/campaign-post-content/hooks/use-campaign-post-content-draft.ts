import React from "react";
import { toast } from "react-toastify";
import { useCampaignStore } from "@/client-side/store";
import { saveCampaignDraftByStep } from "@/client-side/utils/draft.helpers";
import { CampaignDraftLatestStep } from "@/client-side/types/draft.types";
import { postCampaignDraft } from "@/api/client/campaign/draft.api";
import {getCampaignContentFromForm} from "@/client-side/utils/get-campaign-content-from-form.ts";

type Params = {
    postContentDraft: Record<string, string> | null;
    grouped: Record<"main" | "music" | "press", string[]>;
    selectedPlatforms: string[];
};

export const useCampaignPostContentDraft = ({
                                                postContentDraft,
                                                grouped,
                                                selectedPlatforms,
                                            }: Params) => {
    const store = useCampaignStore();
    const actions = useCampaignStore((s) => s.actions);

    const [draftModal, setDraftModal] = React.useState(false);
    const [draftName, setDraftName] = React.useState("");

    const openDraftModal = React.useCallback(() => {
        setDraftName(postContentDraft?.campaignName || store.campaignName || "");
        setDraftModal(true);
    }, [postContentDraft?.campaignName, store.campaignName]);

    const closeDraftModal = React.useCallback(() => {
        setDraftModal(false);
    }, []);

    const onSaveDraft = React.useCallback(async () => {
        try {
            const formData = postContentDraft ?? {};

            if (formData.campaignName) {
                actions.setCampaignName(formData.campaignName);
            }
            console.log("SAVE_DRAFT_formData", formData);
            console.log("SAVE_DRAFT_selectedPlatforms", selectedPlatforms);
            console.log("SAVE_DRAFT_grouped", grouped);
            const campaignContent = getCampaignContentFromForm(
                formData,
                selectedPlatforms,
                grouped,
            );
            console.log("SAVE_DRAFT_campaignContent", campaignContent);
            const freshState = useCampaignStore.getState();

            await saveCampaignDraftByStep({
                step: CampaignDraftLatestStep.addContent,
                state: {
                    ...freshState,
                    campaignContent,
                },
                actions: freshState.actions,
                campaignName: draftName || formData.campaignName || "",
                postCampaignDraft,
                overrides: {
                    campaignContent,
                },
            });

            toast.success("Draft saved successfully!");
            closeDraftModal();
        } catch (error: any) {
            toast.error(error?.message || "Failed to save draft");
        }
    }, [
        postContentDraft,
        actions,
        selectedPlatforms,
        grouped,
        draftName,
        closeDraftModal,
    ]);

    return {
        draftModal,
        draftName,
        setDraftName,
        openDraftModal,
        closeDraftModal,
        onSaveDraft,
    };
};