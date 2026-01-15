import { create } from "zustand";
import type { UserRoleType } from "../../types/user/user.types";

interface LoginState {
  email: string;
  password: string;
  role: UserRoleType;
  errorEmail: string;
  errorPassword: string;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setRole: (role: UserRoleType) => void;
  setErrorEmail: (message: string) => void;
  setErrorPassword: (message: string) => void;
  resetLogin: () => void;
}

export const useLoginStore = create<LoginState>((set) => ({
  email: "",
  password: "",
  role: "client",
  errorEmail: "",
  errorPassword: "",

  setEmail: (email) => set({ email }),
  setPassword: (password) => set({ password }),
  setRole: (role) => set({ role }),
  setErrorEmail: (errorEmail) => set({ errorEmail }),
  setErrorPassword: (errorPassword) => set({ errorPassword }),

  resetLogin: () =>
    set({
      email: "",
      password: "",
      errorEmail: "",
      errorPassword: "",
    }),
}));
