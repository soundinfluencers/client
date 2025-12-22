type PlatformConfig = {
  switcher: boolean;
  musicGenres: boolean;
  themeTopics: boolean;
  audienceInsights: boolean;
};

export const PLATFORM_CONFIG: Record<string, PlatformConfig> = {
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
    switcher: true,
    musicGenres: true,
    themeTopics: false,
    audienceInsights: true,
  },
};