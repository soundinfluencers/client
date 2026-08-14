import type { FC, SVGProps } from "react";

import Instagram from './assets/instagram.svg?react';
import TikTok from './assets/tiktok.svg?react';
import YouTube from './assets/youtube.svg?react';
import Facebook from './assets/facebook.svg?react';
import Spotify from './assets/spotify.svg?react';
import SoundCloud from './assets/soundcloud.svg?react';
import Press from './assets/press.svg?react';

type TSocialMedia =
  | "instagram"
  | "youtube"
  | "tiktok"
  | "facebook"
  | "soundcloud"
  | "spotify"
  | "press";

export const SOCIAL_MEDIA_ICONS = {
  instagram: Instagram,
  tiktok: TikTok,
  youtube: YouTube,
  facebook: Facebook,
  spotify: Spotify,
  soundcloud: SoundCloud,
  press: Press,
} as const satisfies Record<TSocialMedia, FC<SVGProps<SVGSVGElement>>>;
