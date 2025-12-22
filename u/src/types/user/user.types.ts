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

export interface IUser {
  firstName?: string;
  lastName?: string;
  company?: string;
  userRole?: UserRoleType;
  companyType?: ClientCompanyType;
  instagramLink?: string;
  email?: string;
  referralCode?: string;
  phone?: string;
  avatar?: string;
  password?: string;
}
