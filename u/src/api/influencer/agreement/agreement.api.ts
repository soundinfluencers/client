import $api from "../../api";
import type {
  TAgreementResponse,
  TAgreementStats,
} from "@/pages/influencer/agreement/types/agreement.types.ts";
import type { ResponseLoginUserModel } from "@/types/auth/auth.types.ts";

export interface TAgreementAccount {
  accountId: string,
  username: string,
  price: number,
}

export const getAccountAgreement = async (socialAccountId: string): Promise<TAgreementAccount>  => {
  console.log("Fetching agreement for socialAccountId:", socialAccountId);
  const res = await $api.get(`/profile/account-agreement/${socialAccountId}`);
  console.log("Agreement response:", res.data.data);
  console.log("Agreement response to array:", [res.data]);

  return res.data.data as TAgreementAccount;
};

export const getSignupAgreement = async (influencerId: string): Promise<TAgreementResponse>  => {
  console.log("Fetching agreement for influencerId:", influencerId);
  const res = await $api.get(`/profile/signup-agreement/${influencerId}`);
  console.log("Agreement response:", res.data.data);
  console.log("Agreement response to array:", [res.data]);

  return res.data.data as TAgreementResponse;
};

export const signupAgreementAccept = async (status: TAgreementStats, influencerId: string): Promise<ResponseLoginUserModel> => {
  console.log(`Handling agreement action: for influencerId: ${influencerId}`);

  const res = await $api.patch(`/profile/signup-agreement/${status}/${influencerId}`);
  console.log(`Agreement response:`, res.data.data);

  return res.data.data;
};

export const accountAgreementAccept = async (status: TAgreementStats, socialAccountId: string): Promise<void> => {
  console.log(`Handling account agreement action: ${status} for socialAccountId: ${socialAccountId}`);

  await $api.patch(`/profile/account-agreement/${status}/${socialAccountId}`);

  console.log(`Account agreement ${status} successful for socialAccountId: ${socialAccountId}`);
};
