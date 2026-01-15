import type {
  RequestLoginUserModel,
  ResponseLoginUserModel,
} from "../../types/auth/auth.types.ts";
import $api from "../api.ts";

export const loginApi = async ({
  email,
  password,
  role,
}: RequestLoginUserModel): Promise<ResponseLoginUserModel> => {
  try {
    const res = await $api.post("/auth/login", {
      email,
      password,
      role,
    });
    console.log(res, "res");
    return {
      accessToken: res.data.data.accessToken || null,
      role: res.data.data.role || null,
      firstName: res.data.data.firstName,
      balance: res.data.data.balance,
    };
  } catch (error: any) {
    console.error("Error during login:", error);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    throw error;
  }
};

export const logoutApi = async () => {
  await $api.post("/auth/logout");
};
