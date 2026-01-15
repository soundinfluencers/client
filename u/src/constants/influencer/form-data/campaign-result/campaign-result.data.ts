import type {
  TCampaignResultInputData,
  TSocialMedia,
} from "../../../../types/influencer/form/campaign-result/campaign-result.types";

export const CAMPAIGN_RESULT_INPUTS_DATA: TCampaignResultInputData = {
  instagram: {
    inputs: [
      {
        type: "text",
        label: "Instagram link",
        name: "instagramLink",
        placeholder: "Enter Instagram link",
      },
      {
        type: "text",
        label: "Date post",
        name: "datePost",
        placeholder: "Enter date post dd/mm/yyyy",
        // format: "dd/mm/yyyy",
      },
      {
        type: "file",
        label: "Screenshots insights",
        name: "screenshotsInsights",
        placeholder: "Attach the screenshot",
        size: "large",
        description:
          "Please make sure to upload the screenshot at least 24 hours after posting, allowing sufficient time for the content to reach its full audience.",
        //delete accept property
        // accept: ["image/png", "image/jpg", "image/jpeg"],
      },
      {
        type: "number",
        label: "Impressions",
        name: "impressions",
        placeholder: "Enter impressions",
      },
      {
        type: "number",
        label: "Likes",
        name: "likes",
        placeholder: "Enter the likes number here",
      },
      {
        type: "number",
        label: "Comments",
        name: "comments",
        placeholder: "Enter the comments number here",
      },
      {
        type: "number",
        label: "Shares",
        name: "shares",
        placeholder: "Enter the shares number here",
      },
    ],
  },
  youtube: {
    inputs: [
      {
        type: "text",
        label: "YouTube post link",
        name: "youtubePostLink",
        placeholder: "Enter YouTube post link",
      },
      {
        type: "text",
        label: "Date post",
        name: "datePost",
        placeholder: "Enter date post dd/mm/yyyy",
        // format: "dd/mm/yyyy",
      },
      {
        type: "file",
        label: "Screenshots insights",
        name: "screenshotsInsights",
        placeholder: "Attach the screenshot",
        size: "large",
        description:
          "Please make sure to upload the screenshot at least 24 hours after posting, allowing sufficient time for the content to reach its full audience.",
        // accept: ["image/png", "image/jpg", "image/jpeg"],
      },
      {
        type: "number",
        label: "Impressions",
        name: "impressions",
        placeholder: "Enter impressions",
      },
      {
        type: "number",
        label: "Likes",
        name: "likes",
        placeholder: "Enter the likes number here",
      },
      {
        type: "number",
        label: "Comments",
        name: "comments",
        placeholder: "Enter the comments number here",
      },
      {
        type: "number",
        label: "Shares",
        name: "shares",
        placeholder: "Enter the shares number here",
      },
    ],
  },
  tiktok: {
    inputs: [
      {
        type: "text",
        label: "TikTok post link",
        name: "tiktokPostLink",
        placeholder: "Enter TikTok post link",
      },
      {
        type: "text",
        label: "Date post",
        name: "datePost",
        placeholder: "Enter date post dd/mm/yyyy",
        // format: "dd/mm/yyyy",
      },
      {
        type: "file",
        label: "Screenshots insights",
        name: "screenshotsInsights",
        placeholder: "Attach the screenshot",
        size: "large",
        description:
          "Please make sure to upload the screenshot at least 24 hours after posting, allowing sufficient time for the content to reach its full audience.",
        // accept: ["image/png", "image/jpg", "image/jpeg"],
      },
      {
        type: "number",
        label: "Impressions",
        name: "impressions",
        placeholder: "Enter impressions",
      },
      {
        type: "number",
        label: "Likes",
        name: "likes",
        placeholder: "Enter the likes number here",
      },
      {
        type: "number",
        label: "Comments",
        name: "comments",
        placeholder: "Enter the comments number here",
      },
      {
        type: "number",
        label: "Shares",
        name: "shares",
        placeholder: "Enter the shares number here",
      },
    ],
  },
  facebook: {
    inputs: [
      {
        type: "text",
        label: "Facebook post link",
        name: "facebookPostLink",
        placeholder: "Enter Facebook post link",
      },
      {
        type: "text",
        label: "Date post",
        name: "datePost",
        placeholder: "Enter date post dd/mm/yyyy",
        // format: "dd/mm/yyyy",
      },
      {
        type: "file",
        label: "Screenshots insights",
        name: "screenshotsInsights",
        placeholder: "Attach the screenshot",
        size: "large",
        description:
          "Please make sure to upload the screenshot at least 24 hours after posting, allowing sufficient time for the content to reach its full audience.",
        // accept: ["image/png", "image/jpg", "image/jpeg"],
      },
      {
        type: "number",
        label: "Impressions",
        name: "impressions",
        placeholder: "Enter impressions",
      },
      {
        type: "number",
        label: "Likes",
        name: "likes",
        placeholder: "Enter the likes number here",
      },
      {
        type: "number",
        label: "Comments",
        name: "comments",
        placeholder: "Enter the comments number here",
      },
      {
        type: "number",
        label: "Shares",
        name: "shares",
        placeholder: "Enter the shares number here",
      },
    ],
  },
  soundcloud: {
    inputs: [
      {
        type: "file",
        label: "Screenshot of SoundCloud Account including the Track",
        name: "screenshotsSoundcloud",
        size: "large",
        placeholder:
          "Attach here the screenshot of the SoundCloud account including the track",
        description:
          "Please make sure to upload the screenshot at least 24 hours after posting, allowing sufficient time for the content to reach its full audience.",
        // accept: ["image/png", "image/jpg", "image/jpeg"],
      },
    ],
  },
  spotify: {
    inputs: [
      {
        type: "rating",
        label: "How cool is this song to you?",
        name: "songRating",
        placeholder: "",
        maxRating: 5,
      },
      {
        type: "file",
        label: "Screenshot of Spotify Playlist including the Track",
        name: "screenshotsSpotify",
        size: "large",
        placeholder:
          "Attach here the screenshot of the Spotify playlist including the track",
        description:
          "Please make sure to upload the screenshot at least 24 hours after posting, allowing sufficient time for the content to reach its full audience.",
        // accept: ["image/png", "image/jpg", "image/jpeg"],
      },
    ],
  },
  press: {
    inputs: [
      {
        type: "text",
        label: "Article link",
        name: "pressArticleLink",
        placeholder: "Enter article link",
      },
    ],
  },
};

export const normalizeSocialMedia = (value: string): TSocialMedia => {
  switch (value.toLowerCase()) {
    case "instagram":
      return "instagram";
    case "tiktok":
      return "tiktok";
    case "youtube":
      return "youtube";
    case "facebook":
      return "facebook";
    case "spotify":
      return "spotify";
    case "soundcloud":
      return "soundcloud";
    case "press":
      return "press";
    default:
      return "instagram"; // fallback
  }
};
