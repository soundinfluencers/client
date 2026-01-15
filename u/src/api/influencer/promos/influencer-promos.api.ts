import type { socialMediaType } from "../../../types/influencer/promos/promos.types";
import $api from "../../api";
import { AxiosError } from "axios";

export interface RequestInfluencerPromosModel {
  status: string;
  limit: number;
  page: number;
}

// export interface ResponseInfluencerPromosModel {
//   promos: IPromos[];
// }

export interface IPromo {
  campaignId: string;
  selectInfluencersId: string;
  campaignName: string;
  socialMedia: socialMediaType;
  statusCampaign: string;
  closedStatus: string;
  confirmation: string;
  createdAt: string;
}

export const getInfluencerPromos = async ({
  status,
  limit,
  page,
}: RequestInfluencerPromosModel): Promise<IPromo[]> => {
  try {
    const res = await $api.get(
      `/promos?status=${status}&limit=${limit}&page=${page}`
    );
    console.log("Success:", res.data);
    return res.data.data.promos;
  } catch (error: unknown) {
    console.error("Error fetching influencer promos:", error);
    const axiosError = error as AxiosError;
    console.error("Response status:", axiosError.response?.status);
    console.error("Response data:", axiosError.response?.data);
    throw error;
  }
};

export const getInfluencerNewPromo = async (): Promise<any[]> => {
  try {
    const res = await $api.get(`/promos/requests`);
    console.log("Success:", res.data);
    return res.data.data.promos;
  } catch (error: unknown) {
    console.error("Error fetching influencer new promos:", error);
    const axiosError = error as AxiosError;
    console.error("Response status:", axiosError.response?.status);
    console.error("Response data:", axiosError.response?.data);
    throw error;
  }
};