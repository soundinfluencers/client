import $api from "../../api";
import type { TAgreementResponse, TAgreementStats } from "@/pages/influencer/agreement/types/agreement.types.ts";
import type { ResponseLoginUserModel } from "@/types/auth/auth.types.ts";

export const getAgreement = async (influencerId: string): Promise<TAgreementResponse>  => {
  console.log("Fetching agreement for influencerId:", influencerId);
  const res = await $api.get(`/profile/agreement/${influencerId}`);
  console.log("Agreement response:", res.data);

  return res.data.data as TAgreementResponse;
};

export const agreementHandler = async (influencerId: string, action: TAgreementStats): Promise<ResponseLoginUserModel> => {
  console.log(`Handling agreement action: ${action} for influencerId: ${influencerId}`);

  const res = await $api.patch(`/profile/agreement/${action}/${influencerId}`);
  console.log(`Agreement ${action} response:`, res.data.data);

  return res.data.data;
};
