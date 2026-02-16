import $api from "@/api/api";

export const getCsvFile = async (campaignId: string) => {
  return $api.get(`/campaigns/${campaignId}/csv`, {
    responseType: "blob",
  });
};
