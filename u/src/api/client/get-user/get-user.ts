import type { IUser } from "../../../types/user/user.types.ts";
import $api from "../../api.ts";

// getting CLIENT user //

export const getUser = async (access: string, id: string): Promise<any> => {
  try {
    const responce = await $api.get(`/auth/client/${id}`, {
      headers: {
        Authorization: `Bearer ${access}`,
      },
    });
    console.log("Success: user", responce);
    return responce.data;
  } catch (error: any) {
    console.error("Error fetching user:", error);
    console.error("Response status:", error.response?.status);
    console.error("Response data:", error.response?.data);
    throw error;
  }
};
