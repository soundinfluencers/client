import { create } from "zustand";

interface LocalProfileState {
  avatarUrl: string | null;
  setAvatar: (url: string | null) => void;
  resetAvatar: () => void;
}

export const useLocalProfileStore = create<LocalProfileState>((set) => ({
  avatarUrl: null,
  setAvatar: (url) => set({ avatarUrl: url }),
  resetAvatar: () => set({ avatarUrl: null }),
}));
