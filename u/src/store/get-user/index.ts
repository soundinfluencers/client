import { create } from "zustand";
import type { IUser, UserRoleType } from "@/types/user/user.types";

interface User {
  user: IUser | null;
  setUser: (data: IUser) => void;

  role: UserRoleType;
  setRole: (role: UserRoleType) => void;
}

export const useUser = create<User>((set) => ({
  error: "",
  user: null,
  role: "client",

  setRole: (role: UserRoleType) => {
    set({ role: role });
  },
  setUser: (data: IUser) => {
    console.log(data, "IUSer");
    set({ user: data });
  },
}));
