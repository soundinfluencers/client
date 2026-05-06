import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteDraft } from "./campaign-draft.api";

export const useDeleteCampaignDraftMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (draftId: string) => deleteDraft(draftId),

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["dashboard-campaigns"],
            });
        },
    });
};