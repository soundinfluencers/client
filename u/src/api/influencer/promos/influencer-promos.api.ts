import type {
  IPromo,
  IPromoDetailsModel,
  TAcceptDeclineRequestPromoModel,
} from "@/pages/influencer/promos/types/promos.types";
import $api from "../../api";
// import type { AxiosError } from "axios";
import type { TCampaignResultDTO } from "@/pages/influencer/promos/distributing/components/campaign-result-form/types/campaign-result-form.types";

export const getInfluencerPromos = async (status: string, limit: number, page: number): Promise<IPromo[]> => {
  const res = await $api.get(
    `/promos/dashboard?status=${status}&limit=${limit}&page=${page}`,
  );
  console.log("Success get influencer all promos:", res.data);
  return res.data.data.promos;
  
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

// getInfluencerNewPromo
export const getInfluencerNewPromo = async (): Promise<
  IPromoDetailsModel[]
> => {
  const res = await $api.get(`/promos/requests`);
  console.log("Success get new promos:", res.data);
  return res.data.data.promos;
};

// accept/Decline influencer promo request
export const conformationInfluencerPromo = async (
  data: TAcceptDeclineRequestPromoModel,
): Promise<void> => {
  await $api.patch(`/promos/requests`, data);
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

// getInfluencerDetailsPromoByStatus
export const getInfluencerDetailsPromoByStatus = async (
  status: string,
  limit: number,
  page: number,
): Promise<IPromoDetailsModel[]> => {
  const res = await $api.get(
    `/promos/detailed?status=${status}&limit=${limit}&page=${page}`,
  );
  console.log("Success get detailed promos:", res.data);
  return res.data.data.promos;

  // try {
  // } catch (error: unknown) {
  //   console.error("Error fetching influencer promo details by status:", error);
  //   const axiosError = error as AxiosError;
  //   console.error("Response status:", axiosError.response?.status);
  //   console.error("Response data:", axiosError.response?.data);
  //   throw error;
  // }
};

//getInfluencerDetailsPromoByStatusByCampaignIdByAddedAccountsId
export const getInfluencerDetailsPromoByStatusByCampaignIdByAddedAccountsId =
  async (
    status: string,
    campaignId: string,
    addedAccountsId: string,
  ): Promise<IPromoDetailsModel[]> => {
    console.log('Start fetching');
    const res = await $api.get(
      `/promos/detailed/${status}/${campaignId}/${addedAccountsId}`,
    );
    console.log("Success get detailed promo by status, campaignId and addedAccountsId:", res.data.data);
    return [res.data.data];

    // try {

    // } catch (error: unknown) {
    //   console.error(
    //     "Error fetching influencer promo details by status, campaignId and addedAccountsId:",
    //     error,
    //   );
    //   const axiosError = error as AxiosError;
    //   console.error("Response status:", axiosError.response?.status);
    //   console.error("Response data:", axiosError.response?.data);
    //   throw error;
    // }
  };

//create review for promo
export const createInfluencerPromoReview = async (
  data: TCampaignResultDTO,
): Promise<number> => {
  const res = await $api.patch(`/promos`, data);
  console.log("Success create promo review:", res.data.data.balance);
  return res.data.data.balance;
  // try {
  // } catch (error) {
  //   console.error("Error creating influencer promo review:", error);
  //   const axiosError = error as AxiosError;
  //   console.error("Response status:", axiosError.response?.status);
  //   console.error("Response data:", axiosError.response?.data);
  //   throw axiosError;
  // }
};
