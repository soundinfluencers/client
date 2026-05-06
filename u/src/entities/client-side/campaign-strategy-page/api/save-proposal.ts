import $api from "@/api/api.ts";


export const postCampaignProposal = async (payload: Record<string, unknown>) => {
    return $api.post("/proposal-system", payload);
};