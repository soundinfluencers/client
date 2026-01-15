export type UserRoleType = "client" | "influencer";
export type Currency = "EUR" | "USD";

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
export interface BaseUser {
  firstName: string;
  email: string;
  phone: string;
  password: string;
  internalNote?: string;
}

// socialMedias intreface
export interface SocialProfile {
  username: string;
  profileLink: string;
  followers: number;
  logoUrl: string;
  profileCategory: "community" | "personal" | string;
  price: number;
  publicPrice: number;
  initialPrice: number;
  currency: Currency;
  engagementRate: number;
  averageViews: number;
  musicGenres: string[];
  creatorCategories: string[];
  countries: string[];
  categories: string[];
  isHidden: boolean;
  isDeleted: boolean;
  isVerified: boolean;
}

export interface InfluencerPlatforms {
  instagram?: SocialProfile[];
  tiktok?: SocialProfile[];
  spotify?: SocialProfile[];
  soundcloud?: SocialProfile[];
  facebook?: SocialProfile[];
  youtube?: SocialProfile[];
  press?: SocialProfile[];
}

export interface IClientUser extends BaseUser {
  role: "client";
  company: string;
  companyType: string;
  instagramUsername: string;
  referalCode?: string;
}

export interface InfluencerUser extends BaseUser, InfluencerPlatforms {
  role: "influencer";
}

// union user included client and influencer

export type IUser = IClientUser | InfluencerUser;
