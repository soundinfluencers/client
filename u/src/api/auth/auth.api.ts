import type {
  RequestLoginUserModel,
  ResponseLoginUserModel,
} from "@/types/auth/auth.types.ts";
import $api from "../api.ts";
import type { ISignupInfluencerDraft } from "@/types/user/influencer.types.ts";

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

export const resetPasswordApi = async (email: string): Promise<void> => {
  await $api.post("/forgot/email", { email });
};

// influencer register
export const influencerSignupApi = async (data: ISignupInfluencerDraft): Promise<void> => {
  // console.log(data);
  await $api.post("/auth/create/influencer", data);
};