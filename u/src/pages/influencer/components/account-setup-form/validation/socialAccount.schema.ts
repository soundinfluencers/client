import { z } from "zod";
import {
  requiredLogoUrl, profileCurrencyEnum,
  requiredAccountName, requiredFollowers, requiredPrice, requiredProfileLink, profileCategoryEnum,
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

const TOP_COUNTRIES = 5;
const emptyCountries = Array.from({ length: TOP_COUNTRIES }, () => ({
  country: null,
  percentage: null,
}));

const socialAccountDraftBase = z.object({
  accountId: z.string().optional(),

  username: requiredAccountName,
  profileLink: requiredProfileLink,

  followers: requiredFollowers,
  logoUrl: requiredLogoUrl,

  profileCategory: profileCategoryEnum,
  price: requiredPrice,
  currency: profileCurrencyEnum,

  musicGenres: z.array(musicGenresSchema).default([]),
  categories: optionalThemeTopics,
  creatorCategories: z.array(z.string()).default([]),

  countries: audienceInsightsSchema.optional().default(emptyCountries),
});

const instagramAndTiktokAndYoutubeBase = socialAccountDraftBase.extend({
  countries: audienceInsightsSchema,
});

const communitySchema = instagramAndTiktokAndYoutubeBase.extend({
  profileCategory: z.literal("community"),
  musicGenres: requiredMusicGenres,
});

const creatorSchema = instagramAndTiktokAndYoutubeBase.extend({
  profileCategory: z.literal("creator"),
  creatorCategories: creatorCategoriesSchema,
});

const instagramAndTiktokAndYoutubeSchema = z.discriminatedUnion(
  "profileCategory",
  [communitySchema, creatorSchema]
);

const spotifyAndSoundcloudSchema = socialAccountDraftBase.extend({
  profileCategory: z.literal("community"),
  musicGenres: requiredMusicGenres,
});

const facebookSchema = socialAccountDraftBase.extend({
  profileCategory: z.literal("community"),
  musicGenres: requiredMusicGenres,
  countries: audienceInsightsSchema,
});

const pressSchema = socialAccountDraftBase.extend({
  profileCategory: z.literal("community"),
  followers: z.preprocess(() => 0, z.literal(0)),
  musicGenres: requiredMusicGenres,
  countries: audienceInsightsSchema,
});

export const getAccountSchemaByPlatform = (platform: TSocialAccounts) => {
  switch (platform) {
    case "instagram":
    case "tiktok":
    case "youtube":
      return instagramAndTiktokAndYoutubeSchema;

    case "spotify":
    case "soundcloud":
      return spotifyAndSoundcloudSchema;

    case "facebook":
      return facebookSchema;

    case "press":
      return pressSchema;

    default:
      return undefined;
  }
};
