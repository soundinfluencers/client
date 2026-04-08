import {create} from "zustand";
import type { TSocialAccounts } from "@/types/user/influencer.types.ts";

export type TStatusModal = "reviewOffer" | "changePrice" | "addNewAccount" | 'idle';

interface ISocialAccountStatusStore {
  isModalOpen: TStatusModal;
  setIsModalOpen: (status: TStatusModal) => void;
  onCloseModal: () => void;

  accountId: string;
  socialMedia: TSocialAccounts | null;
  setAccountId : (accountId: string) => void;
  setSocialMedia: (socialMedia: TSocialAccounts) => void;
}

export const useSocialAccountStatusStore = create<ISocialAccountStatusStore>((set) => ({
  isModalOpen: 'idle',
  setIsModalOpen: (status) => set({ isModalOpen: status }),
  onCloseModal: () => set({ isModalOpen: 'idle', accountId: '', socialMedia: null }),

  accountId: '',
  socialMedia: null,
  setAccountId: (accountId) => set({ accountId }),
  setSocialMedia: (socialMedia) => set({ socialMedia }),
}));
