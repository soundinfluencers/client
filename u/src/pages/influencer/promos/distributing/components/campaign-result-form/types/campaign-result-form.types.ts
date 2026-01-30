export type TSocialMedia =
  | "instagram"
  | "youtube"
  | "tiktok"
  | "facebook"
  | "soundcloud"
  | "spotify"
  | "press"
  | "multipromo";

interface IBaseInput {
  label: string;
  name: string;
  placeholder: string;
}
export interface ITextInput extends IBaseInput {
  type: "text";
}
export interface INumberInput extends IBaseInput {
  type: "number";
}
export interface IFileInput extends IBaseInput {
  type: "file";
  description: string;
  size: "large";
  // accept: string[];
  // multiple?: boolean;
}
export interface IRatingInput extends IBaseInput {
  type: "rating";
  maxRating?: number;
}

export interface IDateInput extends IBaseInput {
  type: "date";
};

export type TCampaignResultInput =
  | ITextInput
  | INumberInput
  | IFileInput
  | IRatingInput
  | IDateInput;

// Add form type field if needed in future
export interface ICampaignResultConfig {
  inputs: TCampaignResultInput[];
}

export type TCampaignResultInputData = Record<
  TSocialMedia,
  ICampaignResultConfig
>;

export interface ICampaignResultFormData {
  postLink?: string;
  datePost?: string;
  screenshotUrl?: string;
  impressions?: number;
  like?: number;
  comments?: number;
  shares?: number;
  rating?: number;
}

export type TCampaignInfo = {
  campaignId: string;
  addedAccountsId: string;
  username: string;
};

export type TCampaignResultDTO = TCampaignInfo & {
  data: ICampaignResultFormData;
};
