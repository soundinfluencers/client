import type { SocialMediaType } from "../utils/constants.types";

export type TProfileCategory = "community" | "creator";
export type TCurrency = "EUR";

export type TSignupInfluencerScreen =
  | { type: "main" }
  | {
      type: "platform";
      platform: SocialMediaType;
      mode: "create" | "edit";
      accountId?: string;
    };

export interface IInfluencerAccount {
  clientId: string;
  platform: SocialMediaType;

  username: string;
  link: string;
  followersNumber?: string;
  logo?: File | string;

  profileCategory?: TProfileCategory;

  musicStyle?: string;
  musicSubStyles?: string[];

  price?: string;
  publicPrice?: string;
  currency?: TCurrency;

  countries?: {
    country?: string;
    percentage?: number;
  }[];
}

export interface IInfluencerProfile {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface IAccountFormValues {
  username: string;
  link: string;
  followersNumber?: number;
  logo?: File | null;

  profileCategory: "community" | "creator";

  musicStyle?: string;
  musicSubStyles?: string[];

  countries?: {
    country: string;
    percentage: number;
  }[];

  price?: string;
}

// export interface ICountry {
//   country?: string;
//   percentage?: number;
// };

// export interface IPlatform {
//   musicStyle?: string;
//   musicSubStyles?: string[];
//   musicStyleOther?: string[];
//   instagramUsername?: string;
//   instagramLink?: string;
//   followersNumber?: string;
//   logo?: string;
//   price?: string;
//   publicPrice?: string;
//   currency?: TCurrency;
//   countries?: ICountry[];
//   categories?: string[];
//   engagementRate?: number;
//   averageViews?: number;
//   creatorCategories?: string[];
//   profileCategory?: TProfileCategory;
//   initialPrice?: string;
// };

// export interface IInfluencer {
//   firstName?: string;
//   lastName?: string;
//   email?: string;
//   phoneNumber?: string;
//   password?: string;
//   tiktok?: IPlatform[];
//   soundcloud?: IPlatform[];
//   facebook?: IPlatform[];
//   instagram?: IPlatform[];
//   spotify?: IPlatform[];
//   press?: IPlatform[];
// };

// "tiktok": [
//     {
//       "musicStyle": "string",
//       "musicSubStyles": [
//         "string"
//       ],
//       "musicStyleOther": [
//         "string"
//       ],
//       "instagramUsername": "string",
//       "instagramLink": "string",
//       "followersNumber": "string",
//       "logo": "string",
//       "price": "string",
//       "publicPrice": "string",
//       "currency": "EUR",
//       "countries": [
//         {
//           "country": "string",
//           "percentage": 0
//         }
//       ],
//       "categories": [
//         "string"
//       ],
//       "engagementRate": 0,
//       "averageViews": 0,
//       "creatorCategories": [
//         "string"
//       ],
//       "profileCategory": "community",
//       "initialPrice": "string"
//     }
//   ],
