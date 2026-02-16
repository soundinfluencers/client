export type TPromoStatus = "pending" | "distributing" | "completed";
export type TConfirmationType = "accept" | "decline" | "wait";
export type TClosedStatusType = "close" | "wait";
export type TFilterStatus = "new" | "close" | "ongoing";

export type socialMediaType =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "facebook"
  | "spotify"
  | "press"
  | "soundcloud"
  | "multipromo"
  ;

export interface IPromo {
  campaignId: string;
  influencerId: string;
  addedAccountsId: string;
  socialAccountId: string;
  campaignName: string;
  userName: string;
  reward: number;
  socialMedia: socialMediaType;
  createdAt: string;
  statusCampaign: TPromoStatus;
  closedStatus: TClosedStatusType;
  confirmation: TConfirmationType;
}

export interface IPromoDetailsModel {
  campaignId: string;
  influencerId: string;
  addedAccountsId: string;
  socialAccountId: string;
  campaignName: string;
  username: string;
  accountSocialMedia: socialMediaType;
  createdAt: string;
  clientName: string;
  reward: number;
  postLink: string;
  dateRequest: string;
  mainLink: string;
  description: string;
  taggedUser: string;
  taggedLink: string;
  additionalBrief: string;
  statusCampaign: TPromoStatus;
  closedStatus: TClosedStatusType;
  confirmation: TConfirmationType;
}

export type TAcceptDeclineRequestPromoModel = Pick<
  IPromoDetailsModel,
  "campaignId" | "addedAccountsId" | "username"
> & {
  campaignResponse: TConfirmationType;
};

export type TDetailsField = {
  key: keyof IPromoDetailsModel;
  label: string;
  format?: (value: number, promo: IPromoDetailsModel) => string;
  copyable?: boolean;
  linkable?: boolean;
};

export type fieldsConfig = Record<socialMediaType, TDetailsField[]>;


//Mock data
// export const NEW_PROMOS_DATA = [
//   // New promos
//   {
//     campaignId: "cmp123",
//     influencerId: "inf456",
//     selectInfluencersId: "sel789",
//     client: "BrandA",
//     campaignName: "Regard & Afterlife digital twiga circulate",
//     socialMediaUsername: "influencer_handle",
//     accountSocialMedia: "instagram",
//     dateRequest: "2025-12-01T10:00:00.000Z",
//     createdAt: "2025-11-25T09:30:00.000Z",
//     videoLink:
//       "httpss://drive.google.com/file/d/1Vi7bk-NOvfH-_HX-IO5v7Uw6R-q1A5Kg/view?usp=sharing",
//     postDescription:
//       "Insane energy - @mxgpu taking over DTX PORTO @mxqpu - MRBLZ SUDDEN LIGHT Album OUT NOW",
//     storyTag: "@BrandA",
//     storyLink: "https://story.link/sample1",
//     additionalBrief: "Focus on the vibrant colors and beach vibes.",
//     statusCampaign: "Pending",
//   },
//   {
//     campaignId: "cmp124",
//     influencerId: "inf457",
//     selectInfluencersId: "sel790",
//     client: "BrandB",
//     campaignName: "Winter Sale",
//     socialMediaUsername: "another_influencer",
//     accountSocialMedia: "tiktok",
//     dateRequest: "2025-12-05T14:00:00.000Z",
//     createdAt: "2025-11-28T11:15:00.000Z",
//     videoLink:
//       "httpss://drive.google.com/file/d/1Vi7bk-NOvfH-_HX-IO5v7Uw6R-q1A5Kg/view?usp=sharing",
//     postDescription:
//       "Insane energy - @mxgpu taking over DTX PORTO @mxqpu - MRBLZ SUDDEN LIGHT Album OUT NOW",
//     storyTag: "@BrandB",
//     storyLink: "https://story.link/sample2",
//     additionalBrief: "Highlight the discounts and cozy products.",
//     statusCampaign: "Pending",
//   },
//   // Distributing promos
//   {
//     campaignId: "cmp125",
//     influencerId: "inf458",
//     selectInfluencersId: "sel791",
//     client: "BrandC",
//     campaignName: "Spring Festival",
//     socialMediaUsername: "spring_influencer",
//     accountSocialMedia: "youtube",
//     dateRequest: "2025-12-10T16:00:00.000Z",
//     createdAt: "2025-11-30T12:45:00.000Z",
//     videoLink: "https://video.link/sample3",
//     postDescription: "Join me at the Spring Festival with BrandC!",
//     storyTag: "@BrandC",
//     storyLink: "https://story.link/sample3",
//     additionalBrief: "Emphasize the fun and festive atmosphere.",
//     closedStatus: "open",
//     confirmation: "accept",
//     statusCampaign: "Distributing",
//   },
//   {
//     campaignId: "cmp126",
//     influencerId: "inf459",
//     selectInfluencersId: "sel792",
//     client: "BrandD",
//     campaignName: "Autumn Vibes",
//     socialMediaUsername: "autumn_influencer",
//     accountSocialMedia: "instagram",
//     dateRequest: "2025-12-15T18:00:00.000Z",
//     createdAt: "2025-12-01T13:30:00.000Z",
//     videoLink: "https://video.link/sample4",
//     postDescription: "Loving the autumn vibes with BrandD!",
//     storyTag: "@BrandD",
//     storyLink: "https://story.link/sample4",
//     additionalBrief: "Showcase the cozy and warm products.",
//     closedStatus: "open",
//     confirmation: "accept",
//     statusCampaign: "Distributing",
//   },
//   {
//     campaignId: "cmp129",
//     influencerId: "inf459",
//     selectInfluencersId: "sel792",
//     client: "BrandD",
//     campaignName: "Autumn Vibes",
//     socialMediaUsername: "autumn_influencer",
//     accountSocialMedia: "soundcloud",
//     dateRequest: "2025-12-15T18:00:00.000Z",
//     createdAt: "2025-12-01T13:30:00.000Z",
//     videoLink: "https://video.link/sample4",
//     postDescription: "Loving the autumn vibes with BrandD!",
//     storyTag: "@BrandD",
//     storyLink: "https://story.link/sample4",
//     additionalBrief: "Showcase the cozy and warm products.",
//     closedStatus: "open",
//     confirmation: "accept",
//     statusCampaign: "Distributing",
//   },
//   {
//     campaignId: "cmp130",
//     influencerId: "inf459",
//     selectInfluencersId: "sel792",
//     client: "BrandD",
//     campaignName: "Autumn Vibes",
//     socialMediaUsername: "autumn_influencer",
//     accountSocialMedia: "spotify",
//     dateRequest: "2025-12-15T18:00:00.000Z",
//     createdAt: "2025-12-01T13:30:00.000Z",
//     videoLink: "https://video.link/sample4",
//     postDescription: "Loving the autumn vibes with BrandD!",
//     storyTag: "@BrandD",
//     storyLink: "https://story.link/sample4",
//     additionalBrief: "Showcase the cozy and warm products.",
//     closedStatus: "open",
//     confirmation: "accept",
//     statusCampaign: "Distributing",
//   },
//   {
//     campaignId: "cmp131",
//     influencerId: "inf459",
//     selectInfluencersId: "sel792",
//     client: "BrandD",
//     campaignName: "Autumn Vibes",
//     socialMediaUsername: "autumn_influencer",
//     accountSocialMedia: "press",
//     dateRequest: "2025-12-15T18:00:00.000Z",
//     createdAt: "2025-12-01T13:30:00.000Z",
//     videoLink: "https://video.link/sample4",
//     postDescription: "Loving the autumn vibes with BrandD!",
//     storyTag: "@BrandD",
//     storyLink: "https://story.link/sample4",
//     additionalBrief: "Showcase the cozy and warm products.",
//     closedStatus: "open",
//     confirmation: "accept",
//     statusCampaign: "Distributing",
//   },
//   // Completed promos
//   {
//     campaignId: "cmp127",
//     influencerId: "inf460",
//     selectInfluencersId: "sel793",
//     client: "BrandE",
//     campaignName: "Holiday Specials",
//     socialMediaUsername: "holiday_influencer",
//     accountSocialMedia: "tiktok",
//     dateRequest: "2025-12-20T20:00:00.000Z",
//     createdAt: "2025-12-03T14:15:00.000Z",
//     videoLink: "https://video.link/sample5",
//     postDescription: "Get ready for the holidays with BrandE!",
//     storyTag: "@BrandE",
//     storyLink: "https://story.link/sample5",
//     additionalBrief: "Highlight the festive and gift-worthy items.",
//     closedStatus: "closed",
//     confirmation: "accept",
//     reward: 500,
//     statusCampaign: "Completed",
//   },
//   {
//     campaignId: "cmp128",
//     influencerId: "inf461",
//     selectInfluencersId: "sel794",
//     client: "BrandF",
//     campaignName: "New Year Bash",
//     socialMediaUsername: "newyear_influencer",
//     accountSocialMedia: "youtube",
//     dateRequest: "2025-12-25T22:00:00.000Z",
//     createdAt: "2025-12-05T15:00:00.000Z",
//     videoLink: "https://video.link/sample6",
//     postDescription: "Celebrating the New Year with BrandF!",
//     storyTag: "@BrandF",
//     storyLink: "https://story.link/sample6",
//     additionalBrief: "Focus on the celebration and party essentials.",
//     closedStatus: "closed",
//     confirmation: "accept",
//     reward: 750,
//     statusCampaign: "Completed",
//   },

//   // add 3 card for 3 status myltipromo socialMedia
//   {
//     campaignId: "cmp132",
//     influencerId: "inf462",
//     selectInfluencersId: "sel795",
//     client: "BrandG",
//     campaignName: "Multi Promo Campaign",
//     socialMediaUsername: "multi_influencer",
//     accountSocialMedia: "multipromo",
//     dateRequest: "2025-12-30T12:00:00.000Z",
//     createdAt: "2025-12-10T10:00:00.000Z",
//     videoLink: "https://video.link/sample7",
//     postDescription: "Check out my multi promo campaign with BrandG!",
//     storyTag: "@BrandG",
//     storyLink: "https://story.link/sample7",
//     additionalBrief: "Showcase different aspects of the brand across platforms.",
//     statusCampaign: "Pending",
//   },
//   {
//     campaignId: "cmp133",
//     influencerId: "inf463",
//     selectInfluencersId: "sel796",
//     client: "BrandH",
//     campaignName: "Another Multi Promo",
//     socialMediaUsername: "another_multi_influencer",
//     accountSocialMedia: "multipromo",
//     dateRequest: "2026-01-05T14:00:00.000Z",
//     createdAt: "2025-12-15T11:00:00.000Z",
//     videoLink: "https://video.link/sample8",
//     postDescription: "Excited for my multi promo with BrandH!",
//     storyTag: "@BrandH",
//     storyLink: "https://story.link/sample8",
//     additionalBrief: "Highlight various products in a cohesive campaign.",
//     closedStatus: "open",
//     confirmation: "accept",
//     statusCampaign: "Distributing",
//   },
//   {
//     campaignId: "cmp134",
//     influencerId: "inf464",
//     selectInfluencersId: "sel797",
//     client: "BrandI",
//     campaignName: "Final Multi Promo",
//     socialMediaUsername: "final_multi_influencer",
//     accountSocialMedia: "multipromo",
//     dateRequest: "2026-01-10T16:00:00.000Z",
//     createdAt: "2025-12-20T12:00:00.000Z",
//     videoLink: "https://video.link/sample9",
//     postDescription: "Wrapping up my multi promo with BrandI!",
//     storyTag: "@BrandI",
//     storyLink: "https://story.link/sample9",
//     additionalBrief: "Summarize the campaign and key messages.",
//     closedStatus: "closed",
//     confirmation: "accept",
//     reward: 600,
//     statusCampaign: "Completed",
//   },
// ];
