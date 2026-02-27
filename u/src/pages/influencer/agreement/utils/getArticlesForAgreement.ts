import type { TSocialAccounts } from "@/types/user/influencer.types.ts";

export const getArticle = (socialMedia: TSocialAccounts) => {
  switch (socialMedia) {
    case "instagram":
      return 'each post + story';
    case "tiktok":
      return 'each post + story';
    case "spotify":
      return 'each feedback + story';
    case "youtube":
      return 'each post';
    case "facebook":
      return 'each post + story';
    case "soundcloud":
      return 'each repost';
    case "press":
      return 'each article';
    default:
      return '';
  }
}