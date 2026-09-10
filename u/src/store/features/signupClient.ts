import { create } from "zustand";
import type { ClientCompanyType } from "../../types/user/user.types.ts";

interface SignupClientState {
  firstName: string;
  lastName: string;
  company: string;
  companyType: ClientCompanyType | undefined;
  instagramLink: string;
  email: string;
  referralCode: string;
  phone: string;
  page: number;
  password: string;
  errors: {
    firstName: boolean;
    lastName: boolean;
    company: boolean;
    companyType: boolean;
    instagramLink: boolean;
    email: boolean;
    phone: boolean;
  };

  setField: <K extends keyof SignupClientState>(
    key: K,
    value: SignupClientState[K]
  ) => void;
  resetLogin: () => void;
}

export const useSignupClientStore = create<SignupClientState>((set) => ({
  page: 0,
  firstName: "",
  lastName: "",
  company: "",
  companyType: undefined,
  instagramLink: "",
  email: "",
  referralCode: "",
  phone: "",
  password: "",
  errors: {
    firstName: false,
    lastName: false,
    company: false,
    companyType: false,
    instagramLink: false,
    email: false,
    phone: false,
  },

  setField: (key, value) =>
    set((state) => {
      if (key === "errors" || key === "page") return state;
      return { ...state, [key]: value };
    }),

  resetLogin: () =>
    set((state) => ({
      ...state,
      page: 0,
      password: "",
    })),
}));
