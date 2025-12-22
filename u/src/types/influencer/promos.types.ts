// 1) Example response for influencer promos API (get influencer new promos requests) endpoint /promos/requests
// {
//   "statusCode": 200,
//   "message": "Success",
//   "data": {
//     "promos": [
//       {
//         "campaignId": "string",
//         "influencerId": "string",
//         "selectInfluencersId": "string",
//         "client": "string",
//         "campaignName": "string",
//         "socialMediaUsername": "string",
//         "socialMedia": "string",
//         "dateRequest": "2025-12-18T17:55:19.693Z",
//         "createdAt": "2025-12-18T17:55:19.693Z",
//         "videoLink": "string",
//         "postDescription": "string",
//         "storyTag": "string",
//         "storyLink": "string",
//         "additionalBrief": "string"
//       }
//     ]
//   }
// }
// Setup moking data structure for influencer promos API 1) get influencer new promos response, i need interface for that and array of such objects

export type ConfirmationType =
  'accept' |
  'decline';

export interface IInfluencerNewPromo {
  campaignId: string;
  influencerId: string;
  selectInfluencersId: string;
  client: string;
  campaignName: string;
  socialMediaUsername: string;
  socialMedia: string;
  dateRequest: string; // ISO date string
  createdAt: string; // ISO date string
  videoLink: string;
  postDescription: string;
  storyTag: string;
  storyLink: string;
  additionalBrief: string;
  statusCampaign?: string;
  closedStatus?: string;
  confirmation?: ConfirmationType;
};

export const NEW_PROMOS_DATA: IInfluencerNewPromo[] = [
  // New promos
  {
    campaignId: "cmp123",
    influencerId: "inf456",
    selectInfluencersId: "sel789",
    client: "BrandA",
    campaignName: "Summer Launch",
    socialMediaUsername: "influencer_handle",
    socialMedia: "Instagram",
    dateRequest: "2025-12-01T10:00:00.000Z",
    createdAt: "2025-11-25T09:30:00.000Z",
    videoLink: "https://video.link/sample1",
    postDescription: "Check out the new summer collection!",
    storyTag: "@BrandA",
    storyLink: "https://story.link/sample1",
    additionalBrief: "Focus on the vibrant colors and beach vibes.",
    statusCampaign: "Pending",
  },
  {
    campaignId: "cmp124",
    influencerId: "inf457",
    selectInfluencersId: "sel790",
    client: "BrandB",
    campaignName: "Winter Sale",
    socialMediaUsername: "another_influencer",
    socialMedia: "TikTok",
    dateRequest: "2025-12-05T14:00:00.000Z",
    createdAt: "2025-11-28T11:15:00.000Z",
    videoLink: "https://video.link/sample2",
    postDescription: "Don't miss out on the winter sale deals!",
    storyTag: "@BrandB",
    storyLink: "https://story.link/sample2",
    additionalBrief: "Highlight the discounts and cozy products.",
    statusCampaign: "Pending",
  },
  // Distributing promos
  {
    campaignId: "cmp125",
    influencerId: "inf458",
    selectInfluencersId: "sel791",
    client: "BrandC",
    campaignName: "Spring Festival",
    socialMediaUsername: "spring_influencer",
    socialMedia: "YouTube",
    dateRequest: "2025-12-10T16:00:00.000Z",
    createdAt: "2025-11-30T12:45:00.000Z",
    videoLink: "https://video.link/sample3",
    postDescription: "Join me at the Spring Festival with BrandC!",
    storyTag: "@BrandC",
    storyLink: "https://story.link/sample3",
    additionalBrief: "Emphasize the fun and festive atmosphere.",
    closedStatus: "open",
    confirmation: "accept"
  },
  {
    campaignId: "cmp126",
    influencerId: "inf459",
    selectInfluencersId: "sel792",
    client: "BrandD",
    campaignName: "Autumn Vibes",
    socialMediaUsername: "autumn_influencer",
    socialMedia: "Instagram",
    dateRequest: "2025-12-15T18:00:00.000Z",
    createdAt: "2025-12-01T13:30:00.000Z",
    videoLink: "https://video.link/sample4",
    postDescription: "Loving the autumn vibes with BrandD!",
    storyTag: "@BrandD",
    storyLink: "https://story.link/sample4",
    additionalBrief: "Showcase the cozy and warm products.",
    closedStatus: "open",
    confirmation: "accept"
  },
  // Completed promos
  {
    campaignId: "cmp127",
    influencerId: "inf460",
    selectInfluencersId: "sel793",
    client: "BrandE",
    campaignName: "Holiday Specials",
    socialMediaUsername: "holiday_influencer",
    socialMedia: "TikTok",
    dateRequest: "2025-12-20T20:00:00.000Z",
    createdAt: "2025-12-03T14:15:00.000Z",
    videoLink: "https://video.link/sample5",
    postDescription: "Get ready for the holidays with BrandE!",
    storyTag: "@BrandE",
    storyLink: "https://story.link/sample5",
    additionalBrief: "Highlight the festive and gift-worthy items.",
    closedStatus: "close",
    confirmation: "accept"
  },
  {
    campaignId: "cmp128",
    influencerId: "inf461",
    selectInfluencersId: "sel794",
    client: "BrandF",
    campaignName: "New Year Bash",
    socialMediaUsername: "newyear_influencer",
    socialMedia: "YouTube",
    dateRequest: "2025-12-25T22:00:00.000Z",
    createdAt: "2025-12-05T15:00:00.000Z",
    videoLink: "https://video.link/sample6",
    postDescription: "Celebrating the New Year with BrandF!",
    storyTag: "@BrandF",
    storyLink: "https://story.link/sample6",
    additionalBrief: "Focus on the celebration and party essentials.",
    closedStatus: "close",
    confirmation: "accept"
  }
];


// Example response for influencer promos API (returns influencers ongoing or completed promos) endpoint /promos
//
// {
//   "statusCode": 200,
//   "message": "Success",
//   "data": {
//     "promos": [
//       {
//         "campaignId": "string",
//         "influencerId": "string",
//         "selectInfluencersId": "string",
//         "client": "string",
//         "campaignName": "string",
//         "socialMediaUsername": "string",
//         "socialMedia": "string",
//         "dateRequest": "2025-12-18T17:56:54.137Z",
//         "createdAt": "2025-12-18T17:56:54.137Z",
//         "videoLink": "string",
//         "postDescription": "string",
//         "storyTag": "string",
//         "storyLink": "string",
//         "additionalBrief": "string",
//         "statusCampaign": "Pending",
//         "closedStatus": "closed",
//         "confirmation": "accept"
//       }
//     ]
//   }
// }

// Example response for influencer promos API (returns influencers ongoing promo) endpoint /promos/completed/{campaignId}
// {
//   "statusCode": 200,
//   "message": "Success",
//   "data": {
//     "campaignId": "string",
//     "influencerId": "string",
//     "selectInfluencersId": "string",
//     "client": "string",
//     "campaignName": "string",
//     "socialMediaUsername": "string",
//     "socialMedia": "string",
//     "dateRequest": "2025-12-18T17:58:53.874Z",
//     "createdAt": "2025-12-18T17:58:53.874Z",
//     "videoLink": "string",
//     "postDescription": "string",
//     "storyTag": "string",
//     "storyLink": "string",
//     "additionalBrief": "string",
//     "statusCampaign": "Pending",
//     "closedStatus": "closed",
//     "confirmation": "accept"
//   }
// }

// Example response for influencer promos API (returns influencers ongoing promo) endpoint /promos/ongoing/{campaignId}
// {
//   "statusCode": 200,
//   "message": "Success",
//   "data": {
//     "campaignId": "string",
//     "influencerId": "string",
//     "selectInfluencersId": "string",
//     "client": "string",
//     "campaignName": "string",
//     "socialMediaUsername": "string",
//     "socialMedia": "string",
//     "dateRequest": "2025-12-18T18:00:01.594Z",
//     "createdAt": "2025-12-18T18:00:01.594Z",
//     "videoLink": "string",
//     "postDescription": "string",
//     "storyTag": "string",
//     "storyLink": "string",
//     "additionalBrief": "string",
//     "statusCampaign": "Pending",
//     "closedStatus": "closed",
//     "confirmation": "accept"
//   }
// }

// import { type SocialMediaType } from "../utils/constants.types";

export type PromoStatusType =
  'New' |
  'Distributing' |
  'Completed';