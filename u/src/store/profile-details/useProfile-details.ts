import type { Profile } from "@/types/profile-details/profile-detials.types";
import type { IProfileDetails } from "@/types/store/index.types";
import { create } from "zustand";

export const useProfileDetails = create<IProfileDetails>((set) => ({
  profile: null,
  setProfile: (data: Profile) => {
    set({ profile: data });
  },
}));
