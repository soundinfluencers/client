import instagramIcon from "@/assets/social-medias/instagram.svg";
import tiktokIcon from "@/assets/social-medias/tiktok.svg";
import facebookIcon from "@/assets/social-medias/facebook.svg";
import youtubeIcon from "@/assets/social-medias/youtube.svg";
import spotifyIcon from "@/assets/social-medias/spotify.svg";
import soundcloudIcon from "@/assets/social-medias/soundcloud.svg";
import pressIcon from "@/assets/social-medias/press.svg";
import multipromoIcon from "@/assets/social-medias/multipromo.svg";
import plattform_multi from "../../assets/plattform-social_medias/plattform_multi.svg";
import plattform_instagram from "../../assets/plattform-social_medias/plattform_instagram.svg";
import plattform_tiktok from "../../assets/plattform-social_medias/plattform_tiktok.svg";
import plattform_spotify from "../../assets/plattform-social_medias/plattform_spotify.svg";
import plattform_facebook from "../../assets/plattform-social_medias/plattform_facebook.svg";
import plattform_soundclound from "../../assets/plattform-social_medias/plattform_soundcloud.svg";
import plattform_youtube from "../../assets/plattform-social_medias/plattform_youtube.svg";
import plattform_press from "../../assets/plattform-social_medias/plattform_press.svg";
import type { SocialMediaType } from "../../types/utils/constants.types.ts";

export const getSocialMediaIcon = (socialMedia: SocialMediaType) => {
  switch (socialMedia) {
    case "instagram":
      return instagramIcon;
    case "tiktok":
      return tiktokIcon;
    case "facebook":
      return facebookIcon;
    case "youtube":
      return youtubeIcon;
    case "spotify":
      return spotifyIcon;
    case "soundcloud":
      return soundcloudIcon;
    case "press":
      return pressIcon;
    case "multipromo":
      return multipromoIcon;
    default:
      return null;
  }
};
export const getSocialMediaIconPlattform = (socialMedia: SocialMediaType) => {
  switch (socialMedia) {
    case "multipromo":
      return plattform_multi;
    case "instagram":
      return plattform_instagram;
    case "tiktok":
      return plattform_tiktok;
    case "spotify":
      return plattform_spotify;
    case "facebook":
      return plattform_facebook;
    case "soundcloud":
      return plattform_soundclound;
    case "youtube":
      return plattform_youtube;
    case "press":
      return plattform_press;

    default:
      return null;
  }
};
