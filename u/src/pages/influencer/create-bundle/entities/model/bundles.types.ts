type TCurrency = "EUR" | "USD" | "GBP";
type TSocialMedia = "instagram" | "tiktok" | "youtube" | "facebook" | "spotify" | "soundcloud" | "press";

export interface IBundleAccount {
  accountId: string;
  socialMedia: TSocialMedia;
  logoUrl: string;
  username: string;
  followers: number;
  price: number;
}

export interface IGetBundleAccountResponse {
  statusCode: number;
  message: string;
  data: IBundleAccount[];
}

export type TCreateBundleAccount = Pick<IBundleAccount, "accountId" | "socialMedia" | "username">;

export interface ICreateBundleRequest {
  price: number;
  currency: TCurrency;
  accounts: TCreateBundleAccount[];
}

export interface ICreateBundleResponse {
  statusCode: number;
  message: string;
  data: {
    bundleId: string;
  };
}
