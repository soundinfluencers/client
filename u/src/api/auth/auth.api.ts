import type {
  RequestLoginUserModel,
  ResponseLoginUserModel,
} from "../../types/auth/auth.types.ts";
import $api from "../api.ts";

export const loginApi = async ({
  email,
  password,
}: RequestLoginUserModel): Promise<ResponseLoginUserModel> => {
  const res = await $api.post("/auth/login", {
    email,
    password,
  });
  console.log(res.data, "dataatatta");
  return {
    id: res.data._id || null,
    accessToken: res.data?.accessToken || null,
    userRole: res.data?.role || null,
  };
};

export const logoutApi = async () => {
  await $api.post("/auth/logout");
};
