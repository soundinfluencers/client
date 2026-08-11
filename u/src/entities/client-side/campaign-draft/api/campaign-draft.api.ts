
import type { CampaignDraftDto, PromoCreativeDto } from "./campaign-draft.dto.ts";
import $api from "@/api/api.ts";
import axios from "axios";

export class CampaignDraftConflictError extends Error {
    constructor() {
        super("Campaign draft changed elsewhere");
        this.name = "CampaignDraftConflictError";
    }
}

export const getCampaignDraft = async (draftId: string): Promise<CampaignDraftDto> => {
    const res = await $api.get(`/campaigns/draft/${draftId}`);
    return res.data.data;
};

export const postCampaignDraft = async (payload: Record<string, unknown>) => {
    return $api.post("/campaigns/draft", payload);
};

export const updateCampaignDraft = async (payload: Record<string, unknown>) => {
    try {
        const res = await $api.post("/campaigns/draft", payload);
        return res.data.data as { revision: number };
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 409) {
            throw new CampaignDraftConflictError();
        }
        throw error;
    }
};

export const saveCampaignDraftPromo = async (
    draftId: string,
    revision: number,
    promoCreative: PromoCreativeDto,
) => {
    try {
        const res = await $api.patch(`/campaigns/draft/${draftId}/promo`, {
            revision,
            promoCreative,
        });
        return res.data.data as { revision: number };
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 409) {
            throw new CampaignDraftConflictError();
        }
        throw error;
    }
};

export const removeCampaignDraftPromo = async (
    draftId: string,
    revision: number,
) => {
    try {
        const res = await $api.delete(`/campaigns/draft/${draftId}/promo`, {
            data: { revision },
        });
        return res.data.data as { revision: number };
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 409) {
            throw new CampaignDraftConflictError();
        }
        throw error;
    }
};
export const deleteDraft = (draftId: string) =>
    $api.delete(`/campaigns/draft/${draftId}`);
