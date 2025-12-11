import { create } from "zustand";
import type { IUser } from "../../types/user/user.types";
import { getUser } from "../../api/client/get-user/get-user";

interface IUserClient {
  user: IUser | null;
  setUser: (accessToken: string, id: string) => void;
}

export const useClientUser = create<IUserClient>((set) => ({
  user: null,
  error: "",
  setUser: async (accessToken: string, id: string) => {
    try {
      const data = await getUser(accessToken, id);
      console.log(data, "dadawawnlawfjnlfnawlk");
      set({ user: data.client });
    } catch (error) {
      throw error;
    }
  },
}));
