export interface SocialAccount {
  _id: string;

  username: string;
  profileLink: string;
  followers: number;
  logoUrl: string;
  profileCategory: "community" | "creator";

  price: number;
  currency: "EUR";

  musicGenres: {
    genre: string;
    subGenres: string[];
  }[];
  categories: string[];

  creatorCategories: string[];

  countries: { country: string; percentage: number }[];

  isHidden: boolean;
  isDeleted: boolean;
  isVerified: boolean;
};

// Omit<
//   SocialAccount,
//   | "_id"
//   | "engagementRate"
//   | "averageViews"
//   | "isHidden"
//   | "isDeleted"
//   | "isVerified"
//   | "createdAt"
//   | "updatedAt"
//   | "publicPrice"
//   | "initialPrice"
//   | "currency"
// >

export type SocialAccountDraft = {
  username: string;
  profileLink: string;
  followers: number | null;
  logoUrl: string;
  profileCategory: "community" | "creator";

  price: number | null;

  musicGenres: {
    genre: string;
    subGenres: string[];
  }[];
  categories: string[];

  creatorCategories: string[];

  countries: { country: string; percentage: number }[];
};

export type SocialAccountUpdate = Partial<SocialAccountDraft>;

export interface IInfluencer {
  _id: string;

  role: string; //TODO: fix later to enum
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  balance: string;
  statusVerify: string;

  instagram: SocialAccount[];
  tiktok: SocialAccount[];
  youtube: SocialAccount[];
  facebook: SocialAccount[];
  spotify: SocialAccount[];
  soundcloud: SocialAccount[];
  press: SocialAccount[];

  createdAt: string;
  updatedAt: string;
}

export interface ISignupInfluencerDraft {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;

  instagram: SocialAccountDraft[];
  tiktok: SocialAccountDraft[];
  youtube: SocialAccountDraft[];
  facebook: SocialAccountDraft[];
  spotify: SocialAccountDraft[];
  soundcloud: SocialAccountDraft[];
  press: SocialAccountDraft[];
};

export interface IInfluencerProfileUpdate {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  telegram?: string;
};

export interface IInfluencerPasswordUpdate {
  currentPassword: string;
  newPassword: string;
};