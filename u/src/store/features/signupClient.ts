import { create } from "zustand";
import type { IUser, ClientCompanyType } from "../../types/user/user.types.ts";

interface SignupClientState extends IUser {
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
  companyType: undefined as unknown as ClientCompanyType,
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
