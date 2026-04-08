import type { TSocialAccounts } from "@/types/user/influencer.types.ts";

import platform_instagram from "@/assets/plattform-social_medias/plattform_instagram.svg";
import platform_tiktok from "@/assets/plattform-social_medias/plattform_tiktok.svg";
import platform_spotify from "@/assets/plattform-social_medias/plattform_spotify.svg";
import platform_facebook from "@/assets/plattform-social_medias/plattform_facebook.svg";
import platform_soundCloud from "@/assets/plattform-social_medias/plattform_soundcloud.svg";
import platform_youtube from "@/assets/plattform-social_medias/plattform_youtube.svg";
import platform_press from "@/assets/plattform-social_medias/plattform_press.svg";

// import plattform_multi from "@/assets/plattform-social_medias/plattform_multi.svg";

export const MEDIA_ICONS_MAP: Record<TSocialAccounts, string> = {
  instagram: platform_instagram,
  tiktok: platform_tiktok,
  facebook: platform_facebook,
  youtube: platform_youtube,
  spotify: platform_spotify,
  soundcloud: platform_soundCloud,
  press: platform_press,
  // multipromo: plattform_multi,
} as const;
