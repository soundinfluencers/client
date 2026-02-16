import { z } from "zod";

export type Platform =
  | "instagram"
  | "youtube"
  | "tiktok"
  | "facebook"
  | "soundcloud"
  | "spotify"
  | "press"
  | "multipromo";

const REQUIRED = "This field is required";
const INVALID_URL = "Please enter a valid URL";

const requiredString = () =>
  z
  .string({ error: `${REQUIRED}` })
  .trim()
  .min(1, { error: `${REQUIRED}` });

const urlField = () =>
  requiredString().url({ error: `${INVALID_URL}: e.g. https://example.com/p/ABC123` });

const dateRegex = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
const dateField = () =>
  requiredString().regex(dateRegex, {
    error: `Please enter a valid date in dd/mm/yyyy format`,
  });

const intField = () =>
  z
  .number({ error: `${REQUIRED}` })
  .min(0, { error: `Must be 0 or more` });

const ratingField = () =>
  z.number({ error: `Rating is required` });

const socialsDataSchema = z.object({
  postLink: urlField(),
  datePost: dateField(),
  screenshotUrl: urlField(),
  impressions: intField(),
  like: intField(),
  comments: intField(),
  shares: intField(),
});

const soundcloudDataSchema = z.object({
  screenshotUrl: urlField(),
});

const spotifyDataSchema = z.object({
  rating: ratingField(),
  screenshotUrl: urlField(),
});

const pressDataSchema = z.object({
  postLink: urlField(),
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
