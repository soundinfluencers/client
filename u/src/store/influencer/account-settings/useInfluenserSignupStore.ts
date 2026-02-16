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
type FieldError = string | null;

const initialErrors: Record<BaseField, FieldError> = {
  firstName: null,
  lastName: null,
  email: null,
  phone: null,
  password: null,
};

interface ISingupInfluencerState {
  user: ISignupInfluencerDraft;
  errors: Record<BaseField, FieldError>;
  accountsError: string | null;
  submitError: string | null;
}

interface ISingupInfluencerActions {
  setField: <K extends keyof ISignupInfluencerDraft>(
    key: K,
    value: ISignupInfluencerDraft[K],
  ) => void;

  setError: (field: BaseField, message: string | null) => void;
  clearErrors: () => void;

  setAccountsError: (message: string | null) => void;
  clearAccountsError: () => void;
  validateAccounts: () => boolean;

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

export const useInfluencerSignupStore = create<ISingupInfluencerStore>()(
  immer((set, get) => ({
    user: cloneInfluencer(),
    errors: { ...initialErrors },
    accountsError: null,   // <-- NEW
    submitError: null,

    setField: (key, value) =>
      set((state) => {
        state.user[key] = value;

        if (key in state.errors) {
          state.errors[key as BaseField] = null;
        }

        state.submitError = null;
        state.accountsError = null;
      }),

    setError: (field, message) =>
      set((state) => {
        state.errors[field] = message;
      }),

    clearErrors: () =>
      set((state) => {
        state.errors = { ...initialErrors };
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

    validate: () => {
      const { user } = get();

      const nextErrors: Record<BaseField, FieldError> = {
        firstName: validateName(user.firstName),
        lastName: validateName(user.lastName),
        email: validateEmail(user.email),
        phone: validatePhone(user.phone),
        password: validatePassword(user.password),
      };

      const isValid = !Object.values(nextErrors).some((m) => m != null);

      set((state) => {
        state.errors = nextErrors;
      });

      return isValid;
    },

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
        state.errors = { ...initialErrors };
        state.accountsError = null;
        state.submitError = null;
      }),
  })),
);

// validators
const REQUIRED = "This field is required";
const MIN_2 = "Must be at least 2 characters";
const MAX_50 = "Must be no more than 50 characters";

const validateName = (value: string): string | null => {
  const v = value.trim();
  if (!v) return REQUIRED;
  if (v.length < 2) return MIN_2;
  if (v.length > 50) return MAX_50;
  return null;
};

const validateEmail = (value: string): string | null => {
  const v = value.trim();
  if (!v) return REQUIRED;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(v.toLowerCase())) return "Please enter a valid email";
  return null;
};

const validatePhone = (value: string): string | null => {
  const v = value.trim();
  if (!v) return REQUIRED;
  return null;
};

const validatePassword = (value: string): string | null => {
  if (!value) return REQUIRED;
  if (value.length < 8) return "Must be at least 8 characters";
  return null;
};
