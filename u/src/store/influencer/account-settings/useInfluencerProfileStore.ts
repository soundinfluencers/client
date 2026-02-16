import { create } from "zustand";
import type { InfluencerProfileApi } from "@/types/user/influencer.types";

interface IInfluencerProfileStore {
  profile: InfluencerProfileApi | null;
  setProfile: (data: InfluencerProfileApi) => void;
}

export const useInfluencerProfileStore = create<IInfluencerProfileStore>((set) => ({
  profile: null,
  setProfile: (data: InfluencerProfileApi) => {
    set({ profile: data });
  },
}));