import type { TSocialAccountVerifiedStatus } from "@/types/user/influencer.types.ts";

export type UserRoleType = "client" | "influencer";

export type ClientCompanyType =
  | "Artist"
  | "Promoter"
  | "Pr Agent"
  | "Label"
  | "Other";

export const clientCompanyTypes: ClientCompanyType[] = [
  "Artist",
  "Promoter",
  "Pr Agent",
  "Label",
  "Other",
];

// union user included client and influencer
export interface BaseUser {
  // accessToken: string | null;
  balance: number;
  firstName: string;
  role: UserRoleType | null;
  logoUrl: string | null;
  needAgreementRedirect?: boolean;
  verifiedStatus?: TSocialAccountVerifiedStatus;
}

export type IUser = BaseUser;
