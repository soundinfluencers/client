import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteDraft } from "@/api/client/campaign/draft.api";

export const useDeleteDraftMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (draftId: string) => deleteDraft(draftId),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["getCampaigns"] });
    },
  });
};
