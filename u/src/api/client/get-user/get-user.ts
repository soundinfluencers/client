import type { IUser } from "../../../types/user/user.types.ts";
import $api from "../../api.ts";

// getting CLIENT user //

export const getUser = async (access: string, id: string): Promise<any> => {
  try {
    const responce = await $api.get(`/auth/me/`, {
      headers: {
        Authorization: `Bearer ${access}`,
      },
    });
    console.log(responce, "wak;dmjwd;kkd");
    return responce.data.data;
  } catch (error: any) {
    console.error("Error fetching user:", error);
    console.error("Response status:", error.response?.status);
    console.error("Response data:", error.response?.data);
    throw error;
  }
};
