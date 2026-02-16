import type { TPlatformConfigRecord } from "../types/account-setup.types";

export const PLATFORM_CONFIG: TPlatformConfigRecord = {
  instagram: {
    switcher: true,
    musicGenres: true,
    themeTopics: true,
    audienceInsights: true,
  },
  youtube: {
    switcher: true,
    musicGenres: true,
    themeTopics: true,
    audienceInsights: true,
  },
  tiktok: {
    switcher: true,
    musicGenres: true,
    themeTopics: true,
    audienceInsights: true,
  },
  spotify: {
    switcher: false,
    musicGenres: true,
    themeTopics: false,
    audienceInsights: false,
  },
  soundcloud: {
    switcher: false,
    musicGenres: true,
    themeTopics: false,
    audienceInsights: true,
  },
  facebook: {
    switcher: false,
    musicGenres: true,
    themeTopics: true,
    audienceInsights: true,
  },
  press: {
    switcher: false,
    musicGenres: true,
    themeTopics: false,
    audienceInsights: true,
  },
};
