import { z } from "zod";
import { COUNTRY_LIST } from "@/pages/influencer/components/account-setup-form/components/country-input/data/countries.data";

const TOP_COUNTRIES = 5;

type ICountry = { code: string; name: string };

const normalize = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();
const normalizedCountryNames = new Set(
  (COUNTRY_LIST as ICountry[]).map((c) => normalize(c.name)),
);

const MSG = {
  required: "required",
  invalidCountry: "invalidCountry",
  invalidPercentage: "invalidPercentage",
  requiredOnePair: "requiredOnePair",
} as const;

const requiredText = z.string().trim().min(1, MSG.required);

const followersSchema = z.coerce
  .number()
  .int()
  .finite()
  .nonnegative()
  .nullable()
  .refine((v) => v !== null, { message: MSG.required });

const priceSchema = z.coerce
  .number()
  .finite()
  .nonnegative()
  .nullable()
  .refine((v) => v !== null, { message: MSG.required });

const currencySchema = z.enum(["EUR"]).nullable();
const profileCategorySchema = z.enum(["community", "creator"]);

// country: string|null, allow null/empty during typing, validate name if present
const countrySchema = z
  .union([z.string(), z.null()])
  .transform((v) => (typeof v === "string" && v.trim() ? v : null))
  .refine((v) => v === null || normalizedCountryNames.has(normalize(v)), {
    message: MSG.invalidCountry,
  });

// percentage: number|null; allow "" from inputs, and clamp is done in normalizeAccountForApi
// Here we just validate bounds when present.
const percentageSchema = z.preprocess((val) => {
  if (val === "" || val === null || val === undefined) return null;

  if (typeof val === "string") {
    const v = val.replace(",", ".").trim();
    if (v === "" || v === ".") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : NaN;
  }

  return val;
}, z.number().finite().min(0).max(100).nullable());

const countryItemSchema = z.object({
  country: countrySchema,
  percentage: percentageSchema,
});

const countriesSchema = z
  .array(countryItemSchema)
  .length(TOP_COUNTRIES)
  .superRefine((arr, ctx) => {
    const hasAtLeastOneFullPair = arr.some(
      (x) => x.country !== null && x.percentage !== null,
    );

    // 1) Row-level errors: if one is filled — the other is required
    arr.forEach((x, i) => {
      const hasCountry = x.country !== null;
      const hasPercentage = x.percentage !== null;

      if (hasCountry && !hasPercentage) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "required",
          path: [i, "percentage"],
        });
      }

      if (!hasCountry && hasPercentage) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "required",
          path: [i, "country"],
        });
      }
    });

    // 2) Global rule "at least one complete pair"
    // Show hint ONLY on the first completely empty row (where both country and % are empty)
    if (!hasAtLeastOneFullPair) {
      const emptyRowIndex = arr.findIndex(
        (x) => x.country === null && x.percentage === null,
      );

      const i = emptyRowIndex === -1 ? 0 : emptyRowIndex;

      // if the row is completely empty — highlight both fields
      if (arr[i]?.country === null && arr[i]?.percentage === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "requiredOnePair",
          path: [i, "country"],
        });
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "requiredOnePair",
          path: [i, "percentage"],
        });
      }
    }
  });

const musicGenreItemSchema = z.object({
  genre: requiredText,
  subGenres: z.array(requiredText),
});

export const socialAccountFormSchema = z.object({
  // base account
  username: requiredText,
  profileLink: requiredText, // if need: requiredText.url("invalidUrl")

  followers: followersSchema,

  // allow empty string in form; API layer change on PLACEHOLDER_LOGO_URL
  logoUrl: z.string().trim().optional().or(z.literal("")),

  profileCategory: profileCategorySchema,

  price: priceSchema,
  currency: currencySchema, // default "EUR" but keep nullable type compatibility

  // audience insights
  countries: countriesSchema,

  // optional
  musicGenres: z.array(musicGenreItemSchema).default([]),
  categories: z.array(requiredText).default([]),
  creatorCategories: z.array(requiredText).default([]),
});

export type TSocialAccountFormValues = z.infer<typeof socialAccountFormSchema>;

//if checkboxes required logic needed, can be added later
// export const socialAccountFormSchema = z.object({
//   profileCategory: z.enum(["community", "creator"]),
//   musicGenres: z.array(musicGenreItemSchema).default([]),
//   categories: z.array(requiredText).default([]),
//   creatorCategories: z.array(requiredText).default([]),
// }).superRefine((data, ctx) => {
//   if (data.profileCategory === "community") {
//     // если musicGenres блок включен и обязателен
//     // ctx.addIssue({ code: "custom", path: ["musicGenres"], message: "required" });
//   }

//   if (data.profileCategory === "creator") {
//     // хотим хотя бы 1 creatorCategory
//     if (data.creatorCategories.length === 0) {
//       ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["creatorCategories"], message: "required" });
//     }
//   }
// });
