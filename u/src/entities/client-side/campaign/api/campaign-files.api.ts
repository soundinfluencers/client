import api from "@/api/api.ts";

export const getCampaignCsv = async (campaignId: string) => {
    return api.get<Blob>(`/campaigns/${campaignId}/csv`, {
        responseType: "blob",
    });
};

export const getCampaignPdf = async (campaignId: string) => {
    return api.get<Blob>(`/campaigns/${campaignId}/pdf`, {
        responseType: "blob",
        timeout: 15000
    });
};