
import type {
    CampaignDraftGetDto,
    CampaignDraftGetEnvelope,
    CampaignDraftSaveResponseDto,
    CampaignDraftSaveResult,
    SaveCampaignDraftPayload,
} from "./campaign-draft.dto.ts";
import $api from "@/api/api.ts";

export const getCampaignDraft = async (
    draftId: string,
): Promise<CampaignDraftGetDto> => {
    const response = await $api.get<CampaignDraftGetEnvelope>(
        `/campaigns/draft/${draftId}`,
    );

    return response.data.data;
};

export function postCampaignDraft(
    payload: SaveCampaignDraftPayload,
): Promise<CampaignDraftSaveResult>;
export function postCampaignDraft(
    payload: Record<string, unknown>,
): Promise<CampaignDraftSaveResult>;
export async function postCampaignDraft(
    payload: SaveCampaignDraftPayload | Record<string, unknown>,
): Promise<CampaignDraftSaveResult> {
    const response = await $api.post<CampaignDraftSaveResponseDto>(
        "/campaigns/draft",
        payload,
    );

    return response.data.data;
}

// Compatibility alias for remaining legacy callers. Draft v2 update uses the
// same POST endpoint and is selected by the presence of payload.draftId.
export const updateCampaignDraft = postCampaignDraft;
export const deleteDraft = (draftId: string) =>
    $api.delete(`/campaigns/draft/${draftId}`);
