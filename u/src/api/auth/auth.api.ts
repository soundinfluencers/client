import type {
  RequestLoginUserModel,
  ResponseLoginUserModel,
} from "../../types/auth/auth.types.ts";
import $api from "../api.ts";

export const loginApi = async ({
  email,
  password,
}: RequestLoginUserModel): Promise<ResponseLoginUserModel> => {
  const res = await $api.patch("/auth/login", {
    email,
    password,
  });
  console.log(res, "res");
  return {
    id: res.data.data._id || null,
    accessToken: res.data?.data.accessToken || null,
    userRole: res.data?.data.role || null,
  };
};

export const logoutApi = async () => {
  await $api.post("/auth/logout");
};
