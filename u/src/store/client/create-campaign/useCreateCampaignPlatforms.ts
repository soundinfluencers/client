import type { CreateCampaignPlatformProps } from "@/types/store/index.types";
import type { SocialMediaType } from "@/types/utils/constants.types";
import { create } from "zustand";

export const useCreateCampaignPlatform = create<CreateCampaignPlatformProps>(
  (set) => ({
    selectedPlatform: "instagram",
    setPlatform: (platform: SocialMediaType) => {
      set({ selectedPlatform: platform });
    },
  }),
);
