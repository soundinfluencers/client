import { z } from "zod";
import {
  commentsField,
  datePostField, impressionsField, likeField,
  postLinkField, ratingField, screenshotUrlField, sharesField,
} from "@/pages/influencer/promos/distributing/components/campaign-result-form/validation/rules/validation-rules.ts";

export type Platform =
  | "instagram"
  | "youtube"
  | "tiktok"
  | "facebook"
  | "soundcloud"
  | "spotify"
  | "press"
  | "multipromo";

const socialsDataSchema = z.object({
  postLink: postLinkField,
  datePost: datePostField,
  screenshotUrl: screenshotUrlField,
  impressions: impressionsField,
  like: likeField,
  comments: commentsField,
  shares: sharesField,
});

const soundcloudDataSchema = z.object({
  screenshotUrl: screenshotUrlField,
});

const spotifyDataSchema = z.object({
  rating: ratingField,
  screenshotUrl: screenshotUrlField,
});

const pressDataSchema = z.object({
  postLink: postLinkField,
});

const multipromoDataSchema = z.object({}).superRefine((_v, ctx) => {
  ctx.addIssue({
    code: "custom",
    message: "Multipromo is not supported yet",
  });
});

export const getCampaignResultDataSchema = (platform: Platform) => {
  switch (platform) {
    case "instagram":
    case "youtube":
    case "tiktok":
    case "facebook":
      return socialsDataSchema;

    case "soundcloud":
      return soundcloudDataSchema;

    case "spotify":
      return spotifyDataSchema;

    case "press":
      return pressDataSchema;

    case "multipromo":
      return multipromoDataSchema;

    default:
      return socialsDataSchema;
  }
};

export type CampaignResultDataValues = z.infer<
  ReturnType<typeof getCampaignResultDataSchema>
>;
