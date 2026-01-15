import $api from "../../api";
import { AxiosError } from "axios";

export const getInfluencerProfileData = async () => {
  try {
    const response = await $api.get(`/profile/influencer/`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching influencer profile data:", error);
    throw error;
  }
};