import $api from "@/api/api";

export const getShareLink = async (campaignId: string) => {
  try {
    const res = await $api.get(`/campaigns/${campaignId}/share`);
    console.log(res, "resShare");
    return res.data;
  } catch (error) {
    console.log(error);
  }
};
