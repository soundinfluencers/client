import instagramIcon from "../../assets/social-accounts/instagram.svg";
import tiktokIcon from "../../assets/social-accounts/tiktok.svg";
import spotifyIcon from "../../assets/social-accounts/spotify.svg";
import youtubeIcon from "../../assets/social-accounts/youtube.svg";
import facebookIcon from "../../assets/social-accounts/facebook.svg";
import soundcloudIcon from "../../assets/social-accounts/soundcloud.svg";
import pressIcon from "../../assets/social-accounts/press.svg";
import type { SocialMediaType } from "../../types/utils/constants.types";

export interface ISocialAccountMeta {
  id: SocialMediaType;
  label: string;
  icon: string;
}

export const SOCIAL_ACCOUNTS_DATA: ISocialAccountMeta[] = [
  { id: "instagram", label: "Instagram", icon: instagramIcon },
  { id: "tiktok", label: "TikTok", icon: tiktokIcon },
  { id: "spotify", label: "Spotify", icon: spotifyIcon },
  { id: "youtube", label: "YouTube", icon: youtubeIcon },
  { id: "facebook", label: "Facebook", icon: facebookIcon },
  { id: "soundcloud", label: "SoundCloud", icon: soundcloudIcon },
  { id: "press", label: "Press", icon: pressIcon },
];

export const getSocialMeta = (platform: SocialMediaType) => {
  return SOCIAL_ACCOUNTS_DATA.find((item) => item.id === platform);
};
