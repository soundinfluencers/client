import type { TSocialAccounts } from "@/types/user/influencer.types.ts";

export const normalizeSocialMediaName = (socialMedia: TSocialAccounts) => {
  switch (socialMedia) {
    case 'instagram':
      return 'Instagram';
    case 'tiktok':
      return 'TikTok';
    case 'facebook':
      return 'Facebook';
    case 'youtube':
      return 'YouTube';
    case 'spotify':
      return 'Spotify';
    case 'soundcloud':
      return 'SoundCloud';
    case 'press':
      return 'Press';
    default:
      return socialMedia;
  }
};
