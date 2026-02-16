// import type { TSocialAccounts } from "./influencer.types";

// export type SocialAccountDraft = {
//   username: string;
//   profileLink: string;
//   followers: number | null;
//   logoUrl: string;
//   profileCategory: "community" | "creator";
//   price: number | null;
//   musicGenres: {
//     genre: string;
//     subGenres: string[];
//   }[];
//   categories: string[];
//   creatorCategories: string[];
//   countries: { country: string; percentage: number }[];
// };

// export type TSocialAccountUI = SocialAccountDraft & {
//   socialAccountId?: string;
// };

// export type TInfluencerAccountsUI = Record<TSocialAccounts, TSocialAccountUI[]>;


// export interface ISignupInfluencerDraft extends TInfluencerAccountsUI{
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   password: string;
// }

// // API profile flow types
// export interface IProfileSocialAccount {
//   socialAccountId: string;
//   username: string;
// }

// export type TInfluencerProfileAccounts = Record<
//   TSocialAccounts,
//   IProfileSocialAccount[]
// >;

// export interface IInfluencerProfile {
//   firstName?: string;
//   lastName?: string;
//   email?: string;
//   phone?: string;
//   profilePhotoUrl?: string;
//   telegramUsername?: string;

//   accounts: TInfluencerProfileAccounts;
// }