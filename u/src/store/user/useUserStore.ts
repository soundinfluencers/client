import { create } from "zustand";
// import { getUser } from "../../api/user/get-user/get-user";
import type { UserRoleType } from "../../types/user/user.types";

//TODO: move iuser to types folder
interface IUser {
  firstName: string;
  role: UserRoleType;
  balance: number;
};

export interface IUserStore {
  user: IUser | null;
  setUser: (firstName: string, balance: number, userRole: UserRoleType) => void;
};

export const useUserStore = create<IUserStore>((set) => ({
  user: null,
  setUser: (firstName: string, balance: number, userRole: UserRoleType) => {
    set({ user: { firstName, balance, role: userRole } });
  },
}));