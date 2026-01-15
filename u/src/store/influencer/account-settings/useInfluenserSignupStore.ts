import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { TSocialAccounts } from "../../../pages/influencer/components/account-setup-form/types/account-setup.types";
import type {
  ISignupInfluencerDraft,
  SocialAccountDraft,
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

interface ISingupInfluencerState {
  user: ISignupInfluencerDraft;
  errors: Partial<Record<keyof ISignupInfluencerDraft, boolean>>; //TODO: fix types later, create set types for fields
}

interface ISingupInfluencerActions {
  setField: <K extends keyof ISignupInfluencerDraft>(
    key: K,
    value: ISignupInfluencerDraft[K]
  ) => void;

  setError: (field: keyof ISignupInfluencerDraft, value: boolean) => void;
  clearErrors: () => void;
  validate: () => boolean;
  isFormReady: () => boolean;

  saveAccount: (
    platform: TSocialAccounts,
    account: SocialAccountDraft,
    accountId?: number
  ) => void;

  removeAccount: (platform: TSocialAccounts, accountId: number) => void;

  resetSignup: () => void;
}

type ISingupInfluencerStore = ISingupInfluencerState & ISingupInfluencerActions;

export const useInfluenserSignupStore = create<ISingupInfluencerStore>()(
  immer((set, get) => ({
    user: structuredClone(initialInfluencer),

    errors: {
      firstName: false,
      lastName: false,
      email: false,
      phone: false,
      password: false,
    },

    setField: (key, value) =>
      set((state) => {
        state.user[key] = value;
        state.errors[key] = false;
      }),

    setError: (field, value) =>
      set((state) => {
        state.errors[field] = value;
      }),

    clearErrors: () =>
      set((state) => {
        Object.keys(state.errors).forEach((key) => {
          state.errors[key as keyof ISignupInfluencerDraft] = false;
        });
      }),

    validate: () => {
      const { user } = get();
      let isValid = true;

      const setErr = (
        key: keyof ISignupInfluencerDraft,
        condition: boolean
      ) => {
        if (!condition) {
          isValid = false;
          set((state) => {
            state.errors[key] = true;
          });
        }
      };

      setErr("firstName", baseValidateText(user.firstName));
      setErr("lastName", baseValidateText(user.lastName));
      setErr("email", baseValidatedEmail(user.email));
      setErr("phone", baseValidatedPhone(user.phone));
      setErr("password", baseValidatePassword(user.password));

      return isValid;
    },

    isFormReady: () => {
      const { user } = get();

      const hasRequiredFields =
        user.firstName.trim().length > 0 &&
        user.lastName.trim().length > 0 &&
        user.email.trim().length > 0 &&
        user.phone.trim().length > 0 &&
        user.password.trim().length > 0;

      const hasAtLeastOneAccount =
        user.instagram.length > 0 ||
        user.tiktok.length > 0 ||
        user.youtube.length > 0 ||
        user.spotify.length > 0 ||
        user.soundcloud.length > 0 ||
        user.facebook.length > 0 ||
        user.press.length > 0;

      return hasRequiredFields && hasAtLeastOneAccount;
    },

    saveAccount: (
      platform: TSocialAccounts,
      account: SocialAccountDraft,
      accountId?: number
    ) =>
      set((state) => {
        // console.log('Payloda:', platform, account, accountId);

        const list = state.user[platform];
        if (!Array.isArray(list)) return;

        // console.log('List accounts before edit:', list);

        // edit existing
        if (accountId !== undefined) {
          if (accountId < 0 || accountId >= list.length) return;
          // console.log('Accont before edit:', list[accountId]);
          list[accountId] = {
            ...list[accountId],
            ...account,
          };
          // console.log('Accont after edit:', list[accountId]);
          return;
        }

        // create new
        // console.log('Creating new account:', account);
        list.push({ ...account });
        // console.log('List accounts after create:', list);
      }),

    removeAccount: (platform: TSocialAccounts, accountId: number) => {
      set((state) => {
        // console.log("Payload:", platform, accountId)
        const list = state.user?.[platform];
        if (!Array.isArray(list)) return;
        if (accountId < 0 || accountId >= list.length) return;
        // console.log("Account list before removal:", list);
        // console.log("Existing account:", existingAccount);

        // remove by index
        list.splice(accountId, 1);

        // console.log("Account list after removal:", list);
      });
    },

    resetSignup: () =>
      set((state) => {
        state.user = structuredClone(initialInfluencer);
      }),
  }))
);

const baseValidateText = (text: string) => {
  return text.trim().length > 2;
};

const baseValidatedEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

const baseValidatePassword = (password: string) => {
  // Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character
  const re =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return re.test(String(password));
};

const baseValidatedPhone = (phone: string) => {
  const re = /^\+?[1-9]\d{1,14}$/; // E.164 format
  return re.test(String(phone));
};
