
import type { CampaignDraftDto } from "./campaign-draft.dto.ts";
import $api from "@/api/api.ts";

export const getCampaignDraft = async (draftId: string): Promise<CampaignDraftDto> => {
    const res = await $api.get(`/campaigns/draft/${draftId}`);
    console.log(res,'wajhfanfawfnl,wafna');
    return res.data.data;
};

export const postCampaignDraft = async (payload: Record<string, unknown>) => {
    return $api.post("/campaigns/draft", payload);
};

export const updateCampaignDraft = async (payload: Record<string, unknown>) => {

    return $api.post("/campaigns/draft", payload);
};
export const deleteDraft = (draftId: string) =>
    $api.delete(`/campaigns/draft/${draftId}`);