import type { TSocialAccounts } from "@/types/user/influencer.types";

export const normalizePriceLabel = (platform: TSocialAccounts) => {
  switch (platform) {
    case "instagram":
      return "Price for 1 Instagram post & story, include your currency";
    case "youtube":
      return "Price for 1 YouTube post, include your currency";
    case "tiktok":
      return "Price for 1 TikTok post & story, include your currency";
    case "spotify":
      return "Price for 1 Spotify feedback, include your currency";
    case "soundcloud":
      return "Price for 1 SoundCloud repost, include your currency";
    case "facebook":
      return "Price for 1 Facebook post, include your currency";
    case "press":
      return "Price for 1 Article, include your currency";
    default:
      return "Price, include your currency";
  }
};
