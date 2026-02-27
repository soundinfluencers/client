import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type {
  ISignupInfluencerDraft,
  SocialAccountDraft,
  TSocialAccounts,
} from "@/types/user/influencer.types.ts";
import type {
  PersonalDetailsValues,
} from "@/pages/auth/signup/components/influencer/signup-personal-details-form/types/personal-details-form.types.ts";

const initialInfluencer: ISignupInfluencerDraft = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  instagram: [],
  tiktok: [],
  spotify: [],
  soundcloud: [],
  facebook: [],
  youtube: [],
  press: [],
};

interface ISignupInfluencerState {
  user: ISignupInfluencerDraft;
  accountsError: string | null;
  submitError: string | null;
}

interface ISignupInfluencerActions {
  setPersonalFields: (patch: Partial<PersonalDetailsValues>) => void;

  setAccountsError: (message: string | null) => void;
  clearAccountsError: () => void;
  validateAccounts: () => boolean;

  setSubmitError: (message: string | null) => void;
  clearSubmitError: () => void;

  saveAccount: (
    platform: TSocialAccounts,
    account: SocialAccountDraft,
    index?: number,
  ) => void;

  removeAccount: (platform: TSocialAccounts, index: number) => void;

  resetSignup: () => void;
}

type ISignupInfluencerStore = ISignupInfluencerState & ISignupInfluencerActions;

const cloneInfluencer = (): ISignupInfluencerDraft => ({
  ...initialInfluencer,
  instagram: [],
  tiktok: [],
  spotify: [],
  soundcloud: [],
  facebook: [],
  youtube: [],
  press: [],
});

export const useInfluencerSignupStore = create<ISignupInfluencerStore>()(
  immer((set, get) => ({
    user: cloneInfluencer(),
    accountsError: null,
    submitError: null,

    setPersonalFields: (patch) =>
      set((s) => {
        Object.assign(s.user, patch);
      }),

    setAccountsError: (message) =>
      set((state) => {
        state.accountsError = message;
      }),

    clearAccountsError: () =>
      set((state) => {
        state.accountsError = null;
      }),

    setSubmitError: (message) =>
      set((s) => {
        s.submitError = message;
      }),

    clearSubmitError: () =>
      set((state) => {
        state.submitError = null;
      }),

    validateAccounts: () => {
      const { user } = get();

      const hasAtLeastOneAccount =
        (user.instagram?.length ?? 0) > 0 ||
        (user.tiktok?.length ?? 0) > 0 ||
        (user.youtube?.length ?? 0) > 0 ||
        (user.spotify?.length ?? 0) > 0 ||
        (user.soundcloud?.length ?? 0) > 0 ||
        (user.facebook?.length ?? 0) > 0 ||
        (user.press?.length ?? 0) > 0;

      set((state) => {
        state.accountsError = hasAtLeastOneAccount
          ? null
          : "You didn't add any social accounts";
      });

      return hasAtLeastOneAccount;
    },

    saveAccount: (platform, account, index) =>
      set((state) => {
        const list = state.user[platform];

        if (index === undefined || Number.isNaN(index)) {
          list.push(account);
        } else if (index >= 0 && index < list.length) {
          list[index] = account;
        }

        state.accountsError = null;
        state.submitError = null;
      }),

    removeAccount: (platform, index) =>
      set((state) => {
        const list = state.user[platform];
        if (index < 0 || index >= list.length) return;
        list.splice(index, 1);

        state.accountsError = null;
        state.submitError = null;
      }),

    resetSignup: () =>
      set((state) => {
        state.user = cloneInfluencer();
        state.accountsError = null;
        state.submitError = null;
      }),
  })),
);