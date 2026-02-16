import type { FilterData } from "@/types/client/creator-campaign/filters.types";

export const filterArr: FilterData[] = [
  {
    id: "social-platforms-1",
    title: "Social Media Platforms",
    filters: [
      {
        id: "instagram",
        group: "socialMedia",
        filterName: "Instagram",
        count: 328,
      },
      { id: "tiktok", group: "socialMedia", filterName: "TikTok", count: 328 },
      {
        id: "spotify",
        group: "socialMedia",
        filterName: "Spotify",
        count: 328,
      },
      {
        id: "facebook",
        group: "socialMedia",
        filterName: "Facebook",
        count: 328,
      },
      {
        id: "soundcloud",
        group: "socialMedia",
        filterName: "SoundCLoud",
        count: 328,
      },
      {
        id: "youtube",
        group: "socialMedia",
        filterName: "YouTube",
        count: 328,
      },
    ],
  },
  {
    id: "music-genre",
    title: "Music Genre",
    AndOrFlag: [{ method: "And" }, { method: "Or" }],
    filters: [
      {
        id: "Techno",
        filterName: "Techno",
        count: 328,
        group: "genres",
        children: [
          {
            group: "genres",
            id: "(Melodic, Minimal)",
            filterName: "Melodic, Minimal",
            count: 140,
          },
          {
            group: "genres",
            id: "(Hard, Peak)",
            filterName: "Hard, Peak",
            count: 155,
          },
        ],
      },
      {
        id: "House",
        filterName: "House",
        count: 225,
        group: "genres",
        children: [
          {
            group: "genres",
            id: "(Tech House)",
            filterName: "Tech House",
            count: 105,
          },
          {
            group: "genres",
            id: "(Melodic Afro)",
            filterName: "Melodic, Afro",
            count: 35,
          },
        ],
      },
      { id: "EDM", filterName: "EDM", count: 225, group: "genres" },
      {
        id: "Psy, Trance",
        filterName: "Psy, Trance",
        count: 225,
        group: "genres",
      },
    ],
  },
  {
    id: "profile-type",
    title: "Profile Type",
    filters: [
      {
        id: "Community",
        group: "profileType",
        filterName: "Community",
        count: 328,
      },
      {
        id: "Creator",
        group: "profileType",
        filterName: "Creator",
        count: 328,
      },
    ],
  },
  {
    id: "music-categories",
    title: "Music Categories",
    filters: [
      {
        id: "Dance",
        group: "musicCategories",
        filterName: "Dance",
        count: 328,
      },
      {
        id: "Music",
        group: "musicCategories",
        filterName: "Music",
        count: 328,
      },
      {
        id: "Lipsync",
        group: "musicCategories",
        filterName: "Lipsync",
        count: 328,
      },
      {
        id: "Reactions",
        group: "musicCategories",
        filterName: "Reactions",
        count: 328,
      },
      {
        id: "Dubstep",
        group: "musicCategories",
        filterName: "Dubstep",
        count: 328,
      },
    ],
  },
  {
    id: "сountries",
    title: "Countries of Following",
    filters: [
      {
        id: "north-america",
        filterName: "North America",
        count: 328,
        group: "countries",
        children: [
          { group: "countries", id: "US", filterName: "US", count: 140 },
          {
            group: "countries",
            id: "Canada",
            filterName: "Canada",
            count: 155,
          },
          {
            group: "countries",
            id: "Mexico",
            filterName: "Mexico",
            count: 140,
          },
        ],
      },
      {
        id: "Europe",
        filterName: "Europe",
        count: 225,
        group: "countries",
        children: [
          { group: "countries", id: "UK", filterName: "UK", count: 105 },
          {
            group: "countries",
            id: "Germany",
            filterName: "Germany",
            count: 35,
          },
        ],
      },
      { id: "Africa", group: "countries", filterName: "Africa", count: 328 },
      { id: "Iran", group: "countries", filterName: "Iran", count: 328 },
    ],
  },
  {
    id: "additional-еopics",
    title: "Additional Topics",
    filters: [
      {
        group: "addTopics",
        id: "Ibiza",
        filterName: "Ibiza",
        count: 328,
      },

      { id: "Meme", group: "addTopics", filterName: "Meme", count: 328 },
      { id: "Dancers", group: "addTopics", filterName: "Dancers", count: 328 },
    ],
  },
];
