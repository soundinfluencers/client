import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type {
  ISignupInfluencerDraft,
  SocialAccountDraft,
  TSocialAccounts,
} from "../../../types/user/influencer.types";

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

type BaseField = "firstName" | "lastName" | "email" | "phone" | "password";

const initialErrors: Record<BaseField, boolean> = {
  firstName: false,
  lastName: false,
  email: false,
  phone: false,
  password: false,
};

interface ISingupInfluencerState {
  user: ISignupInfluencerDraft;
  errors: Record<BaseField, boolean>;
  submitError: string | null;
}

interface ISingupInfluencerActions {
  setField: <K extends keyof ISignupInfluencerDraft>(
    key: K,
    value: ISignupInfluencerDraft[K],
  ) => void;

  setError: (field: BaseField, value: boolean) => void;
  clearErrors: () => void;
  setSubmitError: (message: string | null) => void;
  clearSubmitError: () => void;
  validate: () => boolean;
  isFormReady: () => boolean;

  saveAccount: (
    platform: TSocialAccounts,
    account: SocialAccountDraft,
    index?: number,
  ) => void;

  removeAccount: (platform: TSocialAccounts, index: number) => void;

  resetSignup: () => void;
}

type ISingupInfluencerStore = ISingupInfluencerState & ISingupInfluencerActions;

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

export const useInfluenserSignupStore = create<ISingupInfluencerStore>()(
  immer((set, get) => ({
    user: cloneInfluencer(),
    errors: { ...initialErrors },
    submitError: null,

    setField: (key, value) =>
      set((state) => {
        state.user[key] = value;

        // reset errors only for base fields
        if (key in state.errors) {
          state.errors[key as BaseField] = false;
        }

        state.submitError = null;
      }),

    setError: (field, value) =>
      set((state) => {
        state.errors[field] = value;
      }),

    clearErrors: () =>
      set((state) => {
        state.errors = { ...initialErrors };
      }),

    setSubmitError: (message) =>
      set((s) => {
        s.submitError = message;
      }),

    clearSubmitError: () =>
      set((state) => {
        state.submitError = null;
      }),

    validate: () => {
      const { user } = get();

      const nextErrors: Record<BaseField, boolean> = {
        firstName: !baseValidateText(user.firstName),
        lastName: !baseValidateText(user.lastName),
        email: !baseValidatedEmail(user.email),
        phone: !baseValidatedPhone(user.phone),
        password: !baseValidatePassword(user.password),
      };

      const isValid = !Object.values(nextErrors).some(Boolean);

      set((state) => {
        state.errors = nextErrors;
      });

      return isValid;
    },

    isFormReady: () => {
      const { user } = get();

      const hasRequiredFields =
        user.firstName.trim().length > 0 &&
        user.lastName.trim().length > 0 &&
        user.email.trim().length > 0 &&
        user.phone.trim().length > 0 &&
        user.password.length > 0;

      const hasAtLeastOneAccount =
        (user.instagram?.length ?? 0) > 0 ||
        (user.tiktok?.length ?? 0) > 0 ||
        (user.youtube?.length ?? 0) > 0 ||
        (user.spotify?.length ?? 0) > 0 ||
        (user.soundcloud?.length ?? 0) > 0 ||
        (user.facebook?.length ?? 0) > 0 ||
        (user.press?.length ?? 0) > 0;

      return hasRequiredFields && hasAtLeastOneAccount;
    },

    saveAccount: (platform, account, index) =>
      set((state) => {
        const list = state.user[platform];

        if (index === undefined || Number.isNaN(index)) {
          list.push(account);
          return;
        }

        if (index < 0 || index >= list.length) return;
        list[index] = account;
      }),

    removeAccount: (platform, index) =>
      set((state) => {
        const list = state.user[platform];
        if (index < 0 || index >= list.length) return;
        list.splice(index, 1);
      }),

    resetSignup: () =>
      set((state) => {
        state.user = cloneInfluencer();
        state.errors = { ...initialErrors };
        state.submitError = null;
      }),
  })),
);

// validators
const baseValidateText = (text: string) => text.trim().length > 2;

const baseValidatedEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

const baseValidatePassword = (password: string) => {
  // min 8 characters
  return /^.{8,}$/.test(String(password));
};

const baseValidatedPhone = (phone: string) => {
  // E.164
  return /^\+?[1-9]\d{1,14}$/.test(String(phone));
};
