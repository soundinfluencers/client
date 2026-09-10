// IApiOffer for offers in CreateCampaign //

import type { ConnectedAccount } from "@/client-side/types/offers";

export interface IApiOffer {
  _id: string;
  title: string;
  socialMedia: string;
  connectedAccounts: IPromoCard[];
  price: number;
  genre: string;
  combinedFollowers: string;
  networksAmount: number;
  storyAndPostDetails: string;
  isPublished: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// IPromoCard for promo card in CreateCampaign //

export interface Country {
  country: string;
  percentage: number;
}

export interface Prices {
  EUR: number;
  USD: number;
  GBP: number;
}
export interface ICampaignAccount extends Pick<
  IPromoCard,
  "accountId" | "influencerId" | "socialMedia" | "username"
> {
  selectedCampaignContentItem: {
    campaignContentItemId: string;
    descriptionId: string;
  };
  dateRequest: string;
}
export interface IPromoCard extends ConnectedAccount {
  fromOffer?: boolean;
}
