// IApiOffer for offers in CreateCampaign //

export interface IApiOffer {
  _id: string;
  title: string;
  socialMedia: string;
  connectedAccounts: {
    _id: string;
    influencerId: string;
    accountId: string;
    socialMediaUsername: string;
    logo: string;
  }[];
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

export interface IPromoCard {
  accountId: string;
  influencerId: string;
  username: string;
  logoUrl: string;
  followers: number;
  prices: Prices;
  socialMedia: string;
  countries: Country[];
  musicGenres: string[];
  creatorCategories: string[];
  categories: string[];
}
