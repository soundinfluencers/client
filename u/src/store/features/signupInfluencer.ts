import { create } from "zustand";

import type { IInfluencerAccount, IInfluencerProfile, TSignupInfluencerScreen } from "../../types/user/influencer.types";
import type { SocialMediaType } from "../../types/utils/constants.types";

interface ISignupInfluencerState extends IInfluencerProfile {
  screen: TSignupInfluencerScreen;
  accounts: IInfluencerAccount[];
  // errors: Partial<Record<keyof IInfluencerProfile, boolean>>;
  // serverErrors?: Partial<Record<keyof IInfluencerProfile, string>>;

  setField: <K extends keyof ISignupInfluencerState>(key: K, value: ISignupInfluencerState[K]) => void;

  openCreateAccount: (platform: SocialMediaType) => void;
  openEditAcccount: (accountId: string) => void;
  goToMain: () => void;

  saveAccount: (account: IInfluencerAccount) => void;
  removeAccount: (accountId: string) => void;

  resetSignup: () => void;
};

const initialProfile: IInfluencerProfile = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  password: '',
};

export const useSignupInfluencerStore = create<ISignupInfluencerState>((set) => ({
  ...initialProfile,
  screen: { type: 'main'},
  accounts: [],
  // errors: {},

  setField: (key, value) => set((state) => {
    if (key === 'accounts' || key === 'screen') {
      return state;
    }

    return { ...state, [key]: value };
  }),

  openCreateAccount: (platform) => set(() => ({
    screen: {
      type: 'platform',
      platform,
      mode: 'create',
    }
  })),

  openEditAcccount: (accountId) => set((state) => {
    const account = state.accounts.find(a => a.clientId === accountId);

    if (!account) {
      return state;
    }

    return {
      screen: {
        type: 'platform',
        platform: account.platform,
        mode: 'edit',
        accountId,
      }
    }
  }),

  goToMain: () => set(() => ({
    screen: { type: 'main'},
  })),

  saveAccount: (account) => set((state) => {
    const exists = state.accounts.some(a => a.clientId === account.clientId);

    return {
      accounts: exists ? state.accounts.map(a => a.clientId === account.clientId ? account : a)
      : [...state.accounts, account],
      screen: { type: 'main' },
    };
  }),

  removeAccount: (accountId) => set((state) => ({
    accounts: state.accounts.filter(a => a.clientId !== accountId),
    screen: { type: 'main' },
  })),

  resetSignup: () => set(() => ({
    ...initialProfile,
    screen: { type: 'main'},
    accounts: [],
    // errors: {},
  })),
}));

