import $api from "@/api/api";
import type { Profile } from "@/types/profile-details/profile-detials.types";

export const fetchProfileDetails = async (
  role: "client" | "influencer"
): Promise<Profile> => {
  try {
    const endpoint =
      role === "client" ? "/profile/client" : "/profile/influencer";
    const response = await $api.get(endpoint);
    const dataFromServer = response.data.data;
    console.log(dataFromServer, "dataFromServer");
    const data: Profile = { ...dataFromServer, role };

    return data;
  } catch (error) {
    console.error("Error fetching profile details:", error);
    throw error;
  }
};
