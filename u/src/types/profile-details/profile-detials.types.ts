import type { UserRoleType } from "../user/user.types";

export interface ProfileBase {
  role: UserRoleType;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface ProfileClient extends ProfileBase {
  role: "client";
  companyName: string;
}

export interface SocialAccount {
  accountId: string;
  username: string;
}

export interface ProfileInfluencer extends ProfileBase {
  role: "influencer";
  instagram?: SocialAccount[];
  tiktok?: SocialAccount[];
  spotify?: SocialAccount[];
  youtube?: SocialAccount[];
  facebook?: SocialAccount[];
  soundcloud?: SocialAccount[];
  press?: SocialAccount[];
  telegramUsername?: string;
  profilePhotoUrl?: string;
}

export type Profile = ProfileClient | ProfileInfluencer;
