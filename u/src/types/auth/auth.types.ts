import type { UserRoleType } from "../user/user.types.ts";

export interface RequestLoginUserModel {
  email: string;
  password: string;
  role: UserRoleType;
}

export interface ResponseLoginUserModel {
  accessToken: string | null;
  firstName: string;
  balance: number;
  role: UserRoleType | null;
}
