import type { TPlatformConfigRecord } from "../types/account-setup.types";

export const PLATFORM_CONFIG: TPlatformConfigRecord = {
  instagram: {
    switcher: true,
    communityMusicGenres: true,
    themeTopics: true,
    audienceInsights: true,
  },
  youtube: {
    switcher: true,
    communityMusicGenres: true,
    themeTopics: true,
    audienceInsights: true,
  },
  tiktok: {
    switcher: true,
    communityMusicGenres: true,
    themeTopics: true,
    audienceInsights: true,
  },
  spotify: {
    switcher: false,
    communityMusicGenres: true,
    themeTopics: false,
    audienceInsights: false,
  },
  soundcloud: {
    switcher: false,
    communityMusicGenres: true,
    themeTopics: false,
    audienceInsights: false,
  },
  facebook: {
    switcher: false,
    communityMusicGenres: true,
    themeTopics: true,
    audienceInsights: true,
  },
  press: {
    switcher: false,
    communityMusicGenres: true,
    themeTopics: false,
    audienceInsights: false,
  },
};
