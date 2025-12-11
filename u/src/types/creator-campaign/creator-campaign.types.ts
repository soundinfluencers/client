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

export interface IPromoCard {
  influencerId: string;
  socialMedia: string;
  _id: string;
  musicStyle: string;
  musicSubStyles: string[];
  musicStyleOther: string[];
  instagramUsername: string;
  instagramLink: string;
  followersNumber: string;
  logo: string;
  profileCategory: string;
  price: string;
  publicPrice: string;
  currency: string;
  initialPrice: number;
  countries: Country[];
  categories: string[];
  engagementRate: number;
  averageViews: number;
  creatorCategories: string[];
  isHidden: boolean;
  isDeleted: boolean;
  isVerified: boolean;
}
export interface Country {
  country: string;
  percentage: number;
  _id: string;
}
