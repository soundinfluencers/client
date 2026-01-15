import $api from "../../api.ts";

// get camapigns client //

export const getCampaigns = async (
  status: string,
  page: number = 1,
  limit: number = 12
): Promise<any[]> => {
  const result = await $api.get(
    `/campaigns?status=${status}&limit=${limit}&page=${page}`
  );
  return result.data.data.campaigns;
};
