import type {
  RequestLoginUserModel,
  ResponseLoginUserModel,
} from "@/types/auth/auth.types.ts";
import $api from "../api.ts";
import type { ISignupInfluencerDraft } from "@/types/user/influencer.types.ts";
import type { UserRoleType } from "@/types/user/user.types.ts";

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

export type TResetPasswordRequest = {
  email: string;
  role: UserRoleType;
};
export const resetPasswordApi = async ({ email, role }: TResetPasswordRequest): Promise<void> => {
  await $api.post("/forgot", { email, role });
};

// influencer register
export const influencerSignupApi = async (
  data: ISignupInfluencerDraft,
): Promise<void> => {
  // console.log(data);
  await $api.post("/auth/create/influencer", data);
};

export const updatePasswordApi = async (
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  console.log("Updating password...");
  await $api.patch("/profile/password", {
    currentPassword,
    newPassword,
  });
  console.log("Password updated successfully", {
    currentPassword,
    newPassword,
  });
};


// TODO: ask Nazar about token undefined case ?
export type TResetPasswordWithTokenRequest = {
  token?: string;
  newPassword: string;
};
export const resetPasswordWithTokenApi = async (requestBody: TResetPasswordWithTokenRequest): Promise<void> => {
  console.log('Resetting password with token...')
  await $api.patch("/forgot", requestBody);
  console.log('Password reset successfully with token', requestBody);
};

interface IGetMeResponse {
  firstName: string;
  role: UserRoleType;
  balance: number;
  logoUrl: string | null;
}

export const getMe = async (): Promise<IGetMeResponse> => {
  const res = await $api.get("/auth/me");
  console.log("getMe: ", res.data.data);
  return res.data.data;
};
