import type { TSocialAccounts } from "@/types/user/influencer.types";

export const normalizePlatform = (platform: TSocialAccounts) => {
  switch (platform) {
    case "tiktok":
      return "TikTok";
    case "youtube":
      return "YouTube";
    case "instagram":
      return "Instagram";
    case "facebook":
      return "Facebook";
    case "soundcloud":
      return "SoundCloud";
    case "spotify":
      return "Spotify";
    case "press":
      return "Press";
    default:
      return "";
  }
};
