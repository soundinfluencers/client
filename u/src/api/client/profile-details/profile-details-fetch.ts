import $api from "@/api/api";
import type { Profile } from "@/types/client/profile-details/profile-detials.types";

export const fetchProfileDetails = async (): Promise<Profile> => {
  try {
    const response = await $api.get("/profile/client");
    const dataFromServer = response.data.data;
    console.log(dataFromServer, "dataFromServer");
    const data: Profile = { ...dataFromServer };

    return data;
  } catch (error) {
    console.error("Error fetching profile details:", error);
    throw error;
  }
};
