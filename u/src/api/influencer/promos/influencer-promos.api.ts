import { allowResultBody } from '@/pages/influencer/promos/model/promo-result-transport';
import { assertGroup, type PromoGroupContext } from '@/pages/influencer/promos/model/promo-write';
import type { BundleDecisionDto } from '@/pages/influencer/promos/types/promo-read.types';
import { hasBundleLinks, isPromoId, readDashboardPromos, readDetailedPromos } from '@/pages/influencer/promos/model/promo-read';
import { BUNDLES_AVAILABLE } from '@/shared/config/bundle-availability';
import type { DashboardPromo, DetailedPromo, PromoReadStatus } from '@/pages/influencer/promos/types/promo-read.types';
import type { AxiosRequestConfig } from 'axios';
import type {
  IPromoDetailsModel,
  TAcceptDeclineRequestPromoModel,
} from "@/pages/influencer/promos/types/promos.types";
import $api from "../../api";
// import type { AxiosError } from "axios";
import type { TCampaignResultDTO } from "@/pages/influencer/promos/distributing/components/campaign-result-form/types/campaign-result-form.types";

export const getInfluencerPromos = async (
  status: string,
  limit: number,
  page: number,
  signal?: AbortSignal,
): Promise<DashboardPromo[]> => {
  const res = await $api.get(
    `/promos/dashboard?status=${status}&limit=${limit}&page=${page}`, { signal, silentReadError: true } as AxiosRequestConfig & { silentReadError: boolean },
  );
  console.log("Success get influencer all promos:", res.data);
  return readDashboardPromos(res.data.data.promos);

  // throw new Error("Function not implemented.");
  // try {
  // } catch (error: unknown) {
  //   console.error("Error fetching influencer promos:", error);
  //   const axiosError = error as AxiosError;
  //   console.error("Response status:", axiosError.response?.status);
  //   console.error("Response data:", axiosError.response?.data);
  //   throw error;
  // }
};

// TODO: getInfluencerNewPromo not used
export const getInfluencerNewPromo = async (): Promise<
  IPromoDetailsModel[]
> => {
  const res = await $api.get(`/promos/requests`);
  console.log("Success get new promos:", res.data);
  return res.data.data.promos;
};

// accept/Decline influencer promo request
export const conformationInfluencerPromo = async (
  data: TAcceptDeclineRequestPromoModel | BundleDecisionDto,
  isCurrent?: () => boolean,
): Promise<void> => {
  if (!BUNDLES_AVAILABLE && (hasBundleLinks(data) || 'selectedAddedAccountsIds' in data)) throw new Error('Bundle promo actions are unavailable.');
  if (!isPromoId(data.campaignId) || !['accept','decline'].includes(data.campaignResponse)) throw new Error('Invalid promo decision.');
  if ('campaignBundleId' in data) {
    if (!isPromoId(data.campaignBundleId) || !data.selectedAddedAccountsIds?.length || data.selectedAddedAccountsIds.some(id => !isPromoId(id)) || new Set(data.selectedAddedAccountsIds).size !== data.selectedAddedAccountsIds.length) throw new Error('Full Bundle membership is required.');
  } else if (hasBundleLinks(data) || !isPromoId(data.addedAccountsId)) throw new Error('Use the complete Bundle decision or a valid placement.');
  const body = 'campaignBundleId' in data
    ? { campaignId: data.campaignId, campaignBundleId: data.campaignBundleId, selectedAddedAccountsIds: data.selectedAddedAccountsIds, campaignResponse: data.campaignResponse }
    : { campaignId: data.campaignId, addedAccountsId: data.addedAccountsId, username: data.username, campaignResponse: data.campaignResponse };
  await $api.patch(`/promos/requests`, body, { silentReadError: true, isCurrentRequest: isCurrent } as AxiosRequestConfig);
  console.log('Successes comformation promos', data);

  // try {
  // } catch (error: unknown) {
  //   console.error("Error confirming influencer promo request:", error);
  //   const axiosError = error as AxiosError;
  //   console.error("Response status:", axiosError.response?.status);
  //   console.error("Response data:", axiosError.response?.data);
  //   throw error;
  // }
};

export type TGetDetailedPromoParams = {
  campaignId?: string;
  addedAccountsId?: string;
  status: PromoReadStatus;
  limit?: number;
  page?: number;
  signal?: AbortSignal;
  isCurrent?: () => boolean;
};

export const getDetailedPromo = async (data: TGetDetailedPromoParams): Promise<DetailedPromo[]> => {
  console.log('Start fetching detailed promos');
  const res = await $api.get(`/promos/detailed`, {
    params: { ...data, signal: undefined, isCurrent: undefined },
    signal: data.signal,
    silentReadError: true,
    isCurrentRequest: data.isCurrent,
  } as AxiosRequestConfig & { silentReadError: boolean });
  console.log("Success get detailed promos:", res);
  return readDetailedPromos(res.data.data.promos, data.status);
};

//create review for promo
export const createInfluencerPromoReview = async (
  data: TCampaignResultDTO,
  group?: PromoGroupContext,
  isCurrent?: () => boolean,
): Promise<unknown> => {
  if (!BUNDLES_AVAILABLE && hasBundleLinks(data)) throw new Error('Bundle promo actions are unavailable.');
  if (group) { assertGroup(group); if (group.campaignId !== data.campaignId || !group.memberIds.includes(data.addedAccountsId)) throw new Error('Invalid Bundle member result identity.'); }
  else if (hasBundleLinks(data)) throw new Error('Frozen Bundle context is required.');
  const res = await $api.patch(`/promos`, allowResultBody(data), { silentReadError: true, isCurrentRequest: isCurrent } as AxiosRequestConfig);
  return res.data?.data?.balance;
};





// // getInfluencerDetailsPromoByStatus
// export const getInfluencerDetailsPromoByStatus = async (
//   status: string,
//   limit: number,
//   page: number,
// ): Promise<IPromoDetailsModel[]> => {
//   const res = await $api.get(
//     `/promos/detailed?status=${status}&limit=${limit}&page=${page}`,
//   );
//   console.log("Success get detailed promos:", res.data.data.promos);
//   return res.data.data.promos;
// };
//
// //getInfluencerDetailsPromoByStatusByCampaignIdByAddedAccountsId
// export const getInfluencerDetailsPromoByStatusByCampaignIdByAddedAccountsId =
//   async (
//     status: string,
//     campaignId: string,
//     addedAccountsId: string,
//   ): Promise<IPromoDetailsModel[]> => {
//     console.log('Start fetching');
//     const res = await $api.get(
//       `/promos/detailed/${status}/${campaignId}/${addedAccountsId}`,
//     );
//     console.log("Success get detailed promo by status, campaignId and addedAccountsId:", res.data.data);
//     return [res.data.data] as IPromoDetailsModel[];
//   };

// Owned promo reconciliation, not a change to the general auth reader.
export const readInfluencerBalance = async (isCurrent?: () => boolean): Promise<unknown> => {
  const res = await $api.get('/auth/me', { silentReadError: true, isCurrentRequest: isCurrent } as AxiosRequestConfig);
  return res.data?.data?.balance;
};

export const uploadPromoScreenshot = async (file: File, signal: AbortSignal, isCurrent?: () => boolean): Promise<string> => {
  const form = new FormData(); form.append('file', file);
  const res = await $api.post('/file', form, { signal, silentReadError: true, isCurrentRequest: isCurrent, headers: { 'Content-Type': 'multipart/form-data' } } as AxiosRequestConfig);
  const url = res.data?.data;
  if (typeof url !== 'string' || !url.trim()) throw new Error('Invalid screenshot response.');
  return url;
};
