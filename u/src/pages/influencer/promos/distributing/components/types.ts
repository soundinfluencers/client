import type { SocialMediaType } from "../../../../../types/utils/constants.types";
import type { CampaignResultFormValues } from "./CampaignResultForm";

export type Platform =
  | "instagram"
  | "tiktok"
  | "facebook"
  | "youtube"
  | "spotify"
  | "soundcloud"
  | "press";

export type FieldType = "text" | "number" | "date" | "file";

export interface CampaignFieldConfig {
  name: keyof CampaignResultFormValues;
  label: string | ((platformLabel: string) => string);
  placeholder?: string | ((platformLabel: string) => string);
  type: FieldType;
  required?: boolean;
  hint?: string;
}

const BASE_SOCIAL_FIELDS: CampaignFieldConfig[] = [
  {
    name: "link",
    label: (platformLabel: string) => `${platformLabel} link`,
    placeholder: (platformLabel: string) => `Enter ${platformLabel} link`,
    type: "text",
    required: true,
  },
  {
    name: "postDate",
    label: "Date post",
    placeholder: "Enter date post dd/mm/yyyy",
    type: "date",
    required: true,
  },
  {
    name: "screenshot",
    label: "Screenshots insights",
    type: "file",
    required: true,
    hint: "Please make sure to upload the screenshot at least 24 hours after posting, allowing sufficient time for the content to reach its full audience.",
  },
];

const METRICS_FIELDS: CampaignFieldConfig[] = [
  { name: "impressions", label: "Impressions", type: "number" },
  { name: "likes", label: "Likes", type: "number" },
  { name: "comments", label: "Comments", type: "number" },
  { name: "shares", label: "Shares", type: "number" },
];

// need add multipromo mok
export const CAMPAIGN_RESULT_FIELDS: Record<SocialMediaType, CampaignFieldConfig[]> = {
  instagram: [...BASE_SOCIAL_FIELDS, ...METRICS_FIELDS],
  tiktok: [...BASE_SOCIAL_FIELDS, ...METRICS_FIELDS],
  facebook: [...BASE_SOCIAL_FIELDS, ...METRICS_FIELDS],
  youtube: [...BASE_SOCIAL_FIELDS, ...METRICS_FIELDS],

  spotify: [
    {
      name: "screenshot",
      label: "Screenshot insights",
      type: "file",
      required: true,
    },
  ],

  soundcloud: [
    {
      name: "screenshot",
      label: "Screenshot insights",
      type: "file",
      required: true,
    },
  ],

  press: [
    {
      name: "link",
      label: "Article link",
      placeholder: "Enter article link",
      type: "text",
      required: true,
    },
  ],

  multipromo: [...BASE_SOCIAL_FIELDS, ...METRICS_FIELDS],
};

export const normalizeSocialMedia = (value: string): SocialMediaType => {
  switch (value.toLowerCase()) {
    case 'instagram':
      return 'instagram';
    case 'tiktok':
      return 'tiktok';
    case 'youtube':
      return 'youtube';
    case 'facebook':
      return 'facebook';
    case 'spotify':
      return 'spotify';
    case 'soundcloud':
      return 'soundcloud';
    case 'press':
      return 'press';
    default:
      return 'multipromo'; // fallback
  }
};

export const PLATFORM_LABELS: Record<SocialMediaType, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  facebook: 'Facebook',
  spotify: 'Spotify',
  soundcloud: 'SoundCloud',
  press: 'Press',
  multipromo: 'MultiPromo',
};
