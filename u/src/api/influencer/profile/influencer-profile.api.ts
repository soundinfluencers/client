//add create/update type dto
import $api from "@/api/https/api";
import type {
  TDeleteSocialAccountDTO,
  InfluencerProfileApi,
  SocialAccountDraft,
  TInfluencerProfileDetailsModel,
  TInfluencerProfileUpdateModel,
  TSocialAccounts,
  TSocialAccountShort,
} from "@/types/user/influencer.types";
import { AxiosError } from "axios";

// Get influencer profile
export const getInfluencerProfile = async (): Promise<InfluencerProfileApi> => {
  try {
    console.log("call get profile");
    const response = await $api.get("/profile/influencer");
    console.log("Response getProfile:", response.data.data);
    return response.data.data as InfluencerProfileApi;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "Error fetching influencer profile:",
        error.response?.data || error.message,
      );
    } else {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
};

// Get social account by ID
export const getSocialAccountById = async (
  platform: TSocialAccounts,
  accountId: string,
): Promise<SocialAccountDraft> => {
  try {
    const response = await $api.get(
      `/profile/social-account/${accountId}/${platform}`,
    );
    return response.data.data as SocialAccountDraft;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "Error fetching social account by ID:",
        error.response?.data || error.message,
      );
    } else {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
};

// Create social account (mb send platform: TSocialAccounts)
export const createSocialAccount = async (
  data: SocialAccountDraft,
  socialMedia: TSocialAccounts,
): Promise<unknown> => {
  console.log("Create social account payload:", { socialMedia, ...data });
  try {
    const response = await $api.post("/profile/social-account", {
      socialMedia,
      payload: data,
    });

    console.log("Profile created successfully:", response.data.data);

    return response.data.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "Error creating influencer profile:",
        error.response?.data || error.message,
      );
    } else {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
};

// Update social account
// type SocialAccountPayload = Omit<SocialAccountDraft, "accountId">;
export const updateSocialAccount = async (
  data: SocialAccountDraft,
  accountId: string,
  platform: TSocialAccounts,
): Promise<TSocialAccountShort> => {
  console.log("Update social account payload:", { platform, accountId, data });
  try {
    const response = await $api.patch("/profile/social-account", {
      ...data,
      accountId,
      socialMedia: platform,
    });

    console.log("Profile updated successfully:", response.data.data);

    return response.data.data as TSocialAccountShort;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "Error updating influencer social account:",
        error.response?.data || error.message,
      );
    } else {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
};

// Delete social account
export const deleteSocialAccount = async (
  data: TDeleteSocialAccountDTO,
): Promise<void> => {
  console.log("Delete social account payload:", data);

  try {
    await $api.delete("/profile/social-account", { data });
    console.log("Social account deleted successfully.");
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "Error deleting social account:",
        error.response?.data || error.message,
      );
    } else {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
};

// Update influencer profile details
export const updateInfluencerProfileDetails = async (
  data: TInfluencerProfileDetailsModel,
): Promise<TInfluencerProfileUpdateModel> => {
  console.log("Update influencer profile details payload:", data);

  try {
    const response = await $api.patch("/profile/influencer/personal", {
      ...data,
    });

    console.log(
      "Influencer profile details updated successfully:",
      response.data.data,
    );

    return response.data.data as TInfluencerProfileUpdateModel;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "Error updating influencer profile details:",
        error.response?.data || error.message,
      );
    } else {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
};
