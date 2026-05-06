import React from "react";
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

type DraftApiResponse =
    | {
    draftId?: string;
    _id?: string;
    data?: {
        draftId?: string;
        _id?: string;
    };
}
    | undefined;

type Params = {
    accounts: CampaignPostContentAccount[];
    campaignPrice: number;
    buildPayload: () => BuiltCampaignPostContentPayload;
};

type SaveDraftPayload = {
    draftId?: string;
    step: CampaignDraftLatestStep;
    campaignName: string;
    socialMedia: string;
    campaignPrice: number;
    addedAccounts: BuiltCampaignPostContentPayload["addedAccounts"];

    campaignContent: BuiltCampaignPostContentPayload["campaignContent"];
    // postContentDraft: Record<string, unknown> | null;
    // blocksDraft: CampaignPostContentBlock[] | null;
    // selectedAccounts: ReturnType<typeof useCampaignBuilderStore.getState>["selectedAccounts"];
};

export const useCampaignPostContentPageDraft = ({
                                                    campaignPrice,
                                                    buildPayload,
                                                }: Params) => {
    const draftId = useCampaignBuilderStore((s) => s.draftId);
    const campaignName = useCampaignBuilderStore((s) => s.campaignName);
    const postContentDraft = useCampaignBuilderStore((s) => s.postContentDraft);
    const blocksDraft = useCampaignBuilderStore((s) => s.blocksDraft);
    const selectedAccounts = useCampaignBuilderStore((s) => s.selectedAccounts);
    const setDraftMeta = useCampaignBuilderStore((s) => s.actions.setDraftMeta);

    const [draftModal, setDraftModal] = React.useState(false);
    const [draftName, setDraftName] = React.useState("");

    const openDraftModal = React.useCallback(() => {
        setDraftName(campaignName || "");
        setDraftModal(true);
    }, [campaignName]);

    const closeDraftModal = React.useCallback(() => {
        setDraftModal(false);
    }, []);

    const onSaveDraft = React.useCallback(async () => {
        try {
            const payload = buildPayload();

            const nextCampaignName = draftName.trim() || campaignName || "";

            if (!nextCampaignName) {
                toast.error("Draft name is required");
                return;
            }

            const draftPayload: SaveDraftPayload = {
                draftId: draftId || undefined,
                step: CampaignDraftLatestStep.addContent,
                campaignName: nextCampaignName,
                socialMedia: payload.socialMedia,
                campaignPrice,
                addedAccounts: payload.addedAccounts,
                campaignContent: payload.campaignContent,
            };
            const response: DraftApiResponse = draftId
                ? await updateCampaignDraft(draftPayload)
                : await postCampaignDraft(draftPayload);


            const nextDraftId =
                response?.draftId ||
                response?._id ||
                response?.data?.draftId ||
                response?.data?._id ||
                null;

            setDraftMeta({
                draftId: nextDraftId,
                draftStep: CampaignDraftLatestStep.addContent,
            });

            toast.success("Draft saved successfully");
            closeDraftModal();
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Failed to save draft";

            toast.error(message);
        }
    }, [
        buildPayload,
        draftId,
        draftName,
        campaignName,
        campaignPrice,
        postContentDraft,
        blocksDraft,
        selectedAccounts,
        setDraftMeta,
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