import $api from "@/api/api";

export const deleteDraft = (draftId: string) =>
  $api.delete(`/campaigns/draft/${draftId}`);
