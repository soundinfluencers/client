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
  accessToken: string | null;
  balance: number;
  firstName: string;
  role: UserRoleType | null;
}
export type IUser = BaseUser;
