import $api from "@/api/api";
import type { Profile } from "@/types/client/profile-details/profile-detials.types";
type ProfileUpdate = {
  firstName: string;
  company: string;
  email: string;
  phone: string;
};

export const fetchProfileDetails = async (): Promise<Profile> => {
  try {
    const response = await $api.get("/profile/client");
    const dataFromServer = response.data.data;

    const data: Profile = { ...dataFromServer };

    return data;
  } catch (error) {
    console.error("Error fetching profile details:", error);
    throw error;
  }
};

export const updateProfile = async (profile: ProfileUpdate) => {
  const response = await $api.patch("/profile/client/personal", profile);

  return response.data;
};
