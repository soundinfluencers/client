import $api from "@/api/api";

export const postBespokeCampaign = async (body: any) => {
  await $api.post(`/campaigns/bespoke`, body, {
    headers: { "Content-Type": "application/json" },
  });
};
