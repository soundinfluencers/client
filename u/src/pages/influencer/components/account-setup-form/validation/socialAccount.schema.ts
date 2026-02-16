import { z } from "zod";
import {
  optionalLogoUrl, profileCategoryEnum, profileCurrencyEnum,
  requiredAccountName, requiredFollowers, requiredPrice, requiredProfileLink,
} from "@/pages/influencer/components/account-setup-form/validation/validation-rules/base-fields.ts";
import {
  musicGenresSchema,
  optionalThemeTopics, requiredMusicGenres,
} from "@/pages/influencer/components/account-setup-form/validation/validation-rules/community.ts";
import {
  creatorCategoriesSchema
} from "@/pages/influencer/components/account-setup-form/validation/validation-rules/creator.ts";
import {
  audienceInsightsSchema
} from "@/pages/influencer/components/account-setup-form/validation/validation-rules/audience-insights.ts";

export const baseCommon = z.object({
  accountId: z.string().optional(),

  username: requiredAccountName,
  profileLink: requiredProfileLink,
  followers: requiredFollowers,

  logoUrl: optionalLogoUrl,
  profileCategory: profileCategoryEnum,
  currency: profileCurrencyEnum,
  price: requiredPrice,

  categories: optionalThemeTopics,
  countries: audienceInsightsSchema,
});

const communitySchema = baseCommon.extend({
  profileCategory: z.literal("community"),
  musicGenres: requiredMusicGenres,
  creatorCategories: z.array(z.string()).default([]),
});

const creatorSchema = baseCommon.extend({
  profileCategory: z.literal("creator"),
  musicGenres: z.array(musicGenresSchema).default([]),
  creatorCategories: creatorCategoriesSchema,
});

export const socialAccountBaseSchema = z.discriminatedUnion("profileCategory", [
  communitySchema,
  creatorSchema,
]);

// .superRefine((data, ctx) => {
//   if (data.profileCategory === "community") {
//     if (!Array.isArray(data.musicGenres) || data.musicGenres.length < 1) {
//       ctx.addIssue({
//         code: 'custom',
//         path: ["musicGenres"],
//         message: "Select at least one music genre",
//       });
//     }
//     return; // 👈 важно: дальше creator-правила не нужны
//   }
//
//   // creator => creatorCategories must contain 1 from each set
//   if (data.profileCategory === "creator") {
//     const arr = Array.isArray(data.creatorCategories) ? data.creatorCategories : [];
//
//     const hasEntertainment = arr.some((v) => ENTERTAINMENT_SET.has(v));
//     const hasMusic = arr.some((v) => MUSIC_SET.has(v));
//
//     if (!hasEntertainment || !hasMusic) {
//       ctx.addIssue({
//         code: 'custom',
//         path: ["creatorCategories"], // одна ошибка на оба блока
//         message: "Select at least one option",
//       });
//     }
//   }
// });