import React from "react";
import { toast } from "react-toastify";
import { useDeleteCampaignDraftMutation } from "@/entities/client-side/campaign-draft/api/campaign-draft.mutations";

export const useDeleteCampaignDraft = () => {
    const mutation = useDeleteCampaignDraftMutation();

    const deleteDraft = React.useCallback(
        (draftId: string, options?: { onSuccess?: () => void }) => {
            mutation.mutate(draftId, {
                onSuccess: () => {
                    toast.success("Draft deleted successfully!");
                    options?.onSuccess?.();
                },
                onError: () => {
                    toast.error("Failed to delete draft");
                },
            });
        },
        [mutation],
    );

    return {
        deleteDraft,
        isDeleting: mutation.isPending,
    };
};