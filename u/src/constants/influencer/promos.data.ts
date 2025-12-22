// I need interface and mock data for influencer promos API response (social media wacth in social-accounts.data.ts, and status NEW, DISTRIBUTING, COMPLETED) and mix all combinations of socilal media and status
// socila media from SocialMediaType    
// | 'instagram'
    // | 'tiktok'
    // | 'facebook'
    // | 'youtube'
    // | 'spotify'
    // | 'soundcloud'
    // | 'press'
    // | 'multipromo';


export interface IInfluencerNewPromo {
  campaignId: string;
  influencerId: string;
  selectInfluencersId: string;
  client: string;
  campaignName: string;
  socialMediaUsername: string;
  socialMedia: string;
  dateRequest: string;
  createdAt: string;
  videoLink: string;
  postDescription: string;
  storyTag: string;
  storyLink: string;
  additionalBrief: string;
  statusCampaign: 'New' | 'Distributing' | 'Completed';
  closedStatus: 'closed' | 'open';
  confirmation?: 'accept' | 'decline';
}

export const NEW_PROMOS_DATA: IInfluencerNewPromo[] = [
  {
    campaignId: "promo1",
    influencerId: "influencer1",
    selectInfluencersId: "select1",
    client: "Client A",
    campaignName: "Summer Campaign",
    socialMediaUsername: "influencerA",
    socialMedia: "Instagram",
    dateRequest: "2024-06-01T10:00:00.000Z",
    createdAt: "2024-06-01T09:00:00.000Z",
    videoLink: "http://example.com/video1",
    postDescription: "Check out my summer look!",
    storyTag: "@clientA",
    storyLink: "http://example.com/story1",
    additionalBrief: "Use hashtag #SummerVibes",
    statusCampaign: "New",
    closedStatus: "open",
    // confirmation: "accept"
  },
  {
    campaignId: "promo2",
    influencerId: "influencer2",
    selectInfluencersId: "select2",
    client: "Client B",
    campaignName: "Winter Campaign",
    socialMediaUsername: "influencerB",
    socialMedia: "TikTok",
    dateRequest: "2024-06-02T11:00:00.000Z",
    createdAt: "2024-06-02T10:00:00.000Z",
    videoLink: "http://example.com/video2",
    postDescription: "Winter fashion is here!",
    storyTag: "@clientB",
    storyLink: "http://example.com/story2",
    additionalBrief: "Highlight the new collection",
    statusCampaign: "Distributing",
    closedStatus: "open",
    // confirmation: "decline"
  },
  {
    campaignId: "promo3",
    influencerId: "influencer3",
    selectInfluencersId: "select3",
    client: "Client C",
    campaignName: "Spring Campaign",
    socialMediaUsername: "influencerC",
    socialMedia: "YouTube",
    dateRequest: "2024-06-03T12:00:00.000Z",
    createdAt: "2024-06-03T11:00:00.000Z",
    videoLink: "http://example.com/video3",
    postDescription: "Spring into style!",
    storyTag: "@clientC",
    storyLink: "http://example.com/story3",
    additionalBrief: "Focus on outdoor activities",
    statusCampaign: "Completed",
    closedStatus: "closed",
    // confirmation: "accept"
  },
  {
    campaignId: "promo4",
    influencerId: "influencer4",
    selectInfluencersId: "select4",
    client: "Client D",
    campaignName: "Autumn Campaign",
    socialMediaUsername: "influencerD",
    socialMedia: "Facebook",
    dateRequest: "2024-06-04T13:00:00.000Z",
    createdAt: "2024-06-04T12:00:00.000Z",
    videoLink: "http://example.com/video4",
    postDescription: "Falling for autumn styles!",
    storyTag: "@clientD",
    storyLink: "http://example.com/story4",
    additionalBrief: "Emphasize cozy fashion",
    statusCampaign: "New",
    closedStatus: "open",
    // confirmation: "decline"
  },
  {
    campaignId: "promo5",
    influencerId: "influencer5",
    selectInfluencersId: "select5",
    client: "Client E",
    campaignName: "Holiday Campaign",
    socialMediaUsername: "influencerE",
    socialMedia: "Spotify",
    dateRequest: "2024-06-05T14:00:00.000Z",
    createdAt: "2024-06-05T13:00:00.000Z",
    videoLink: "http://example.com/video5",
    postDescription: "Holiday tunes for everyone!",
    storyTag: "@clientE",
    storyLink: "http://example.com/story5",
    additionalBrief: "Promote holiday playlist",
    statusCampaign: "Distributing",
    closedStatus: "open",
    // confirmation: "accept"
  },
  {
    campaignId: "promo6",
    influencerId: "influencer6",
    selectInfluencersId: "select6",
    client: "Client F",
    campaignName: "Fitness Campaign",
    socialMediaUsername: "influencerF",
    socialMedia: "SoundCloud",
    dateRequest: "2024-06-06T15:00:00.000Z",
    createdAt: "2024-06-06T14:00:00.000Z",
    videoLink: "http://example.com/video6",
    postDescription: "Get fit with me!",
    storyTag: "@clientF",
    storyLink: "http://example.com/story6",
    additionalBrief: "Highlight workout routines",
    statusCampaign: "Completed",
    closedStatus: "closed",
    // confirmation: "decline"
  },
  {
    campaignId: "promo7",
    influencerId: "influencer7",
    selectInfluencersId: "select7",
    client: "Client G",
    campaignName: "Tech Campaign",
    socialMediaUsername: "influencerG",
    socialMedia: "Press",
    dateRequest: "2024-06-07T16:00:00.000Z",
    createdAt: "2024-06-07T15:00:00.000Z",
    videoLink: "http://example.com/video7",
    postDescription: "Latest tech reviews!",
    storyTag: "@clientG",
    storyLink: "http://example.com/story7",
    additionalBrief: "Focus on new gadgets",
    statusCampaign: "New",
    closedStatus: "open",
    // confirmation: "accept"
  },
  {
    campaignId: "promo8",
    influencerId: "influencer8",
    selectInfluencersId: "select8",
    client: "Client H",
    campaignName: "Gaming Campaign",
    socialMediaUsername: "influencerH",
    socialMedia: "multipromo",
    dateRequest: "2024-06-08T17:00:00.000Z",
    createdAt: "2024-06-08T16:00:00.000Z",
    videoLink: "http://example.com/video8",
    postDescription: "Top gaming moments!",
    storyTag: "@clientH",
    storyLink: "http://example.com/story8",
    additionalBrief: "Showcase gameplay highlights",
    statusCampaign: "Distributing",
    closedStatus: "open",
    // confirmation: "decline"
  }
];