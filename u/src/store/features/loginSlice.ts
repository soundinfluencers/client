import { create } from "zustand";

interface LoginState {
  email: string;
  password: string;
  errorEmail: string;
  errorPassword: string;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setErrorEmail: (message: string) => void;
  setErrorPassword: (message: string) => void;
  resetLogin: () => void;
}

export const useLoginStore = create<LoginState>((set) => ({
  email: "",
  password: "",
  errorEmail: "",
  errorPassword: "",

  setEmail: (email) => set({ email }),
  setPassword: (password) => set({ password }),
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
