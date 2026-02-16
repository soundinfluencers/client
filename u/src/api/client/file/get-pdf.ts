import $api from "@/api/api";

export const getPdfFile = async (campaignId: string) => {
  return await $api.get(`/campaigns/${campaignId}/pdf`, {
    responseType: "blob",
  });
};
