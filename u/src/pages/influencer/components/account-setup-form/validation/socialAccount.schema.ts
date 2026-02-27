import { z } from "zod";
import {
  requiredLogoUrl, profileCurrencyEnum,
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
import type { TSocialAccounts } from "@/types/user/influencer.types.ts";

export const baseCommonStrict = z.object({
  accountId: z.string().optional(),

  username: requiredAccountName,
  profileLink: requiredProfileLink,
  followers: requiredFollowers,

  logoUrl: requiredLogoUrl,
  // profileCategory: profileCategoryEnum,
  currency: profileCurrencyEnum,
  price: requiredPrice,

  categories: optionalThemeTopics,
  countries: audienceInsightsSchema,
});

export const baseCommonNoCountriesCheck = z.object({
  accountId: z.string().optional(),

  username: requiredAccountName,
  profileLink: requiredProfileLink,
  followers: requiredFollowers,

  logoUrl: requiredLogoUrl,
  // profileCategory: profileCategoryEnum,
  currency: profileCurrencyEnum,
  price: requiredPrice,

  categories: optionalThemeTopics,

  countries: z.any(),
});

const communityStrict = baseCommonStrict.extend({
  profileCategory: z.literal("community"),
  musicGenres: requiredMusicGenres,
  creatorCategories: z.array(z.string()).default([]),
});

const creatorStrict = baseCommonStrict.extend({
  profileCategory: z.literal("creator"),
  musicGenres: z.array(musicGenresSchema).default([]),
  creatorCategories: creatorCategoriesSchema,
});

export const socialAccountStrictSchema = z.discriminatedUnion("profileCategory", [
  communityStrict,
  creatorStrict,
]);

const communityNoCountries = baseCommonNoCountriesCheck.extend({
  profileCategory: z.literal("community"),
  musicGenres: requiredMusicGenres,
  creatorCategories: z.array(z.string()).default([]),
});

const creatorNoCountries = baseCommonNoCountriesCheck.extend({
  profileCategory: z.literal("creator"),
  musicGenres: z.array(musicGenresSchema).default([]),
  creatorCategories: creatorCategoriesSchema,
});
export const socialAccountBaseSchema = z.discriminatedUnion("profileCategory", [
  communityNoCountries,
  creatorNoCountries,
]);

export const getAccountSchemaForPlatform = (platform: TSocialAccounts) => {
  if (platform === "spotify" || platform === "soundcloud") {
    return socialAccountBaseSchema;
  }
  return socialAccountStrictSchema;
};


// export const makeSocialAccountSchema = (platform: TSocialAccounts) => {
//   const audienceEnabled = platform !== "spotify" && platform !== "soundcloud";
//
//   return socialAccountBaseSchema.superRefine((data, ctx) => {
//     if (!audienceEnabled) return;
//
//     const res = audienceInsightsSchema.safeParse(data.countries);
//     if (!res.success) {
//       ctx.addIssue({
//         code: "custom",
//         path: ["countries"],
//         message: res.error.issues[0]?.message ?? "Audience insights is invalid",
//       });
//     }
//   });
// };



// .superRefine((data, ctx) => {
//   if (data.profileCategory === "community") {
//     if (!Array.isArray(data.musicGenres) || data.musicGenres.length < 1) {
//       ctx.addIssue({
//         code: 'custom',
//         path: ["musicGenres"],
//         message: "Select at least one music genre",
//       });
//     }
//     return;
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
//         path: ["creatorCategories"],
//         message: "Select at least one option",
//       });
//     }
//   }
// });


// export const makeSocialAccountSchema = (platform: TSocialAccounts) => {
//   const audienceEnabled = platform !== "spotify" && platform !== "soundcloud";
//
//   return z
//   .discriminatedUnion("profileCategory", [communitySchema, creatorSchema])
//   .superRefine((data, ctx) => {
//     if (!audienceEnabled) return;
//
//     const res = audienceInsightsSchema.safeParse(data.countries);
//
//     if (!res.success) {
//       const first = res.error.issues[0];
//       ctx.addIssue({
//         code: "custom",
//         path: ["countries"],
//         message: first?.message ?? "Audience insights is invalid",
//       });
//     }
//   });
// };

// export const makeSocialAccountSchema = (platform: TSocialAccounts) => {
//   const audienceEnabled =
//     platform !== "spotify" && platform !== "soundcloud";
//
//   return z.discriminatedUnion("profileCategory", [
//     baseCommon.extend({
//       profileCategory: z.literal("community"),
//       musicGenres: requiredMusicGenres,
//       creatorCategories: z.array(z.string()).default([]),
//       countries: makeAudienceInsightsSchema(audienceEnabled),
//     }),
//
//     baseCommon.extend({
//       profileCategory: z.literal("creator"),
//       musicGenres: z.array(musicGenresSchema).default([]),
//       creatorCategories: creatorCategoriesSchema,
//       countries: makeAudienceInsightsSchema(audienceEnabled),
//     }),
//   ]);
// };