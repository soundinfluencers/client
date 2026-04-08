import React from "react";
import { toast } from "react-toastify";
import { useDeleteDraftMutation } from "@/client-side/react-query";

export const useDeleteDraftAction = () => {
    const mutation = useDeleteDraftMutation();

    const deleteDraft = React.useCallback(
        (e: React.MouseEvent, draftId: string) => {
            e.stopPropagation();
            mutation.mutate(draftId, {
                onSuccess: () => {
                    toast.success("Draft deleted successfully!");
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