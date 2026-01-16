import type {
  RequestLoginUserModel,
  ResponseLoginUserModel,
} from "@/types/auth/auth.types.ts";
import $api from "../api.ts";

export const loginApi = async ({
  email,
  password,
  role,
}: RequestLoginUserModel): Promise<ResponseLoginUserModel> => {
  const { data } = await $api.post("/auth/login", {
    email,
    password,
    role,
  });
  console.log(data, "login");
  return data.data;
};

export const logoutApi = async () => {
  await $api.post("/auth/logout");
};
