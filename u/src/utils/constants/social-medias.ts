import instagramIcon from '@/assets/social-medias/instagram.svg';
import tiktokIcon from '@/assets/social-medias/tiktok.svg';
import facebookIcon from '@/assets/social-medias/facebook.svg';
import youtubeIcon from '@/assets/social-medias/youtube.svg';
import spotifyIcon from '@/assets/social-medias/spotify.svg';
import soundcloudIcon from '@/assets/social-medias/soundcloud.svg';
import pressIcon from '@/assets/social-medias/press.svg';
import multipromoIcon from '@/assets/social-medias/multipromo.svg';

import type {SocialMediaType} from "../../types/utils/constants.types.ts";

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
}