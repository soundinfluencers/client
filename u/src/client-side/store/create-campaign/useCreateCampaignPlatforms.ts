import { create } from "zustand";
import type { CreateCampaignPlatformState } from "./types";

export const useCreateCampaignPlatform =
    create<CreateCampaignPlatformState>((set) => ({
        selectedPlatform: "instagram",
        setPlatform: (platform) => set({ selectedPlatform: platform }),
    }));