import { z } from "zod";
import {
  requiredLogoUrl, profileCurrencyEnum,
  requiredAccountName, requiredFollowers, requiredPrice, requiredProfileLink, profileCategoryEnum,
} from "@/pages/influencer/components/account-setup-form/validation/validation-rules/base-fields.ts";
import {
  optionalCommunityThemeTopics, requiredCommunityMusicGenres,
} from "@/pages/influencer/components/account-setup-form/validation/validation-rules/community.ts";
import {
  requiredCreatorContentFocus, requiredCreatorMusicGenres,
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

  communityMusicGenres: z.array(z.string()).default([]),
  communityThemeTopics: optionalCommunityThemeTopics,
  creatorMusicGenres: z.array(z.string()).default([]),
  creatorContentFocus: z.array(z.string()).default([]),

  countries: audienceInsightsSchema.optional().default(emptyCountries),
});

const instagramAndTiktokAndYoutubeBase = socialAccountDraftBase.extend({
  countries: audienceInsightsSchema,
});

const communitySchema = instagramAndTiktokAndYoutubeBase.extend({
  profileCategory: z.literal("community"),
  communityMusicGenres: requiredCommunityMusicGenres,
});

const creatorSchema = instagramAndTiktokAndYoutubeBase.extend({
  profileCategory: z.literal("creator"),
  creatorMusicGenres: requiredCreatorMusicGenres,
  creatorContentFocus: requiredCreatorContentFocus,
});

const instagramAndTiktokAndYoutubeSchema = z.discriminatedUnion(
  "profileCategory",
  [communitySchema, creatorSchema]
);

const spotifyAndSoundcloudSchema = socialAccountDraftBase.extend({
  profileCategory: z.literal("community"),
  communityMusicGenres: requiredCommunityMusicGenres,
});

const facebookSchema = socialAccountDraftBase.extend({
  profileCategory: z.literal("community"),
  communityMusicGenres: requiredCommunityMusicGenres,
  countries: audienceInsightsSchema,
});

const pressSchema = socialAccountDraftBase.extend({
  profileCategory: z.literal("community"),
  followers: z.preprocess(() => 0, z.literal(0)),
  communityMusicGenres: requiredCommunityMusicGenres,
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
