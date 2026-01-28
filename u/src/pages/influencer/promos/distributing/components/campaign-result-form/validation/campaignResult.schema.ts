import { z } from "zod";
import type { TSocialMedia } from "../types/campaign-result-form.types";

const trimString = (v: unknown) => (typeof v === "string" ? v.trim() : v);
const emptyToUndef = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

const withHttpsIfMissing = (v: unknown) => {
  v = trimString(v);
  if (typeof v !== "string") return v;

  const s = v.trim();
  if (!s) return s;

  if (/^https?:\/\//i.test(s)) return s;

  return `https://${s}`;
};

export const optionalPostLink = z.preprocess(
  (v) => {
    v = emptyToUndef(v);
    if (v === undefined) return undefined;
    return withHttpsIfMissing(v);
  },
  z.httpUrl({ message: "" }).optional(),
);

export const requiredPostLink = z.preprocess(
  (v) => withHttpsIfMissing(v),
  z
    .string({ message: "" })
    .min(1, { message: "" })
    .url({ message: "" }),
);

const optionalUrl = z.preprocess(
  (v) => emptyToUndef(trimString(v)),
  z.string().url({ message: "" }).optional(),
);

const requiredUrl = z.preprocess(
  (v) => trimString(v),
  z.string({ message: "" }).min(1, { message: "" }).url({ message: "" }),
);

// ---- numbers ----
const toNumberOrUndef = (v: unknown) => {
  v = emptyToUndef(trimString(v));
  if (v === undefined) return undefined;
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(n) ? n : NaN;
};

// optional int >= 0 (если хочешь >0 — замени gte(0) на positive())
const optionalIntMin0 = z.preprocess(
  toNumberOrUndef,
  z.number().int().gte(0, { message: "" }).optional(),
);
// required int >= 0 (если хочешь >0 — замени gte(0) на positive())
const requiredIntMin0 = z.preprocess(
  toNumberOrUndef,
  z.number({ message: "" }).int().gte(0, { message: "" }),
);

// optional rating >= 0
const optionalRatingMin0 = z.preprocess(
  toNumberOrUndef,
  z.number().gte(0, { message: "" }).optional(),
);
// required rating >= 0 (если надо >0 — positive())
const requiredRatingMin0 = z.preprocess(
  toNumberOrUndef,
  z.number({ message: "" }).gte(0, { message: "" }),
);

// datePost строка, без проверки формата
const optionalDateString = z.preprocess(
  (v) => emptyToUndef(trimString(v)),
  z.string().optional(),
);

const baseSchema = z.object({
  postLink: optionalPostLink,
  screenshotUrl: optionalUrl,

  impressions: optionalIntMin0,
  like: optionalIntMin0,
  comments: optionalIntMin0,
  shares: optionalIntMin0,
  saves: optionalIntMin0,

  rating: optionalRatingMin0,
  datePost: optionalDateString,
});

export const getCampaignResultSchema = (meta: TSocialMedia) => {
  if (meta === "spotify" || meta === "soundcloud") {
    return baseSchema.extend({
      rating: requiredRatingMin0,
      screenshotUrl: requiredPostLink,
    });
  }

  if (meta === "press") {
    return baseSchema.extend({
      postLink: requiredPostLink,
    });
  }

  return baseSchema.extend({
    postLink: requiredPostLink,
    impressions: requiredIntMin0,
    like: requiredIntMin0,
    screenshotUrl: requiredUrl,
  });
};
