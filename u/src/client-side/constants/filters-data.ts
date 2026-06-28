import type { FilterData } from "@/types/client/creator-campaign/filters.types";

export const filterArr: FilterData[] = [
  {
    id: "social-platforms-1",
    title: "Social Media Platforms",
    filters: [
      { id: "instagram", group: "socialMedia", filterName: "Instagram", count: 328 },
      { id: "tiktok", group: "socialMedia", filterName: "TikTok", count: 328 },
      { id: "spotify", group: "socialMedia", filterName: "Spotify", count: 328 },
      { id: "facebook", group: "socialMedia", filterName: "Facebook", count: 328 },
      { id: "soundcloud", group: "socialMedia", filterName: "SoundCloud", count: 328 },
      { id: "youtube", group: "socialMedia", filterName: "YouTube", count: 328 },
    ],
  },
  {
    id: "profile-type",
    title: "Profile Type",
    filters: [
      { id: "community", group: "profileType", filterName: "Community", count: 328 },
      { id: "creator", group: "profileType", filterName: "Creator", count: 328 },
    ],
  },
  {
    id: "music-genre",
    title: "Music Genres",
    AndOrFlag: [{ method: "And" }, { method: "Or" }],
    filters: [
      {
        id: "techno",
        filterName: "Techno",
        count: 328,
        group: "genres",
        children: [
          {
            id: "techno_melodic_minimal",
            group: "genres",
            filterName: "Melodic, Minimal",
            count: 140,
            apiTargets: {
              communityMusicGenres: ["techno_melodic_minimal"],
              creatorMusicGenres: ["electronic_techno_melodic_minimal"],
            },
          },
          {
            id: "techno_hard_peak",
            group: "genres",
            filterName: "Hard, Peak",
            count: 155,
            apiTargets: {
              communityMusicGenres: ["techno_hard_peak"],
              creatorMusicGenres: ["electronic_techno_hard_peak"],
            },
          },
        ],
      },
      {
        id: "house",
        filterName: "House",
        count: 225,
        group: "genres",
        children: [
          {
            id: "house_tech_house",
            group: "genres",
            filterName: "Tech House",
            count: 105,
            apiTargets: {
              communityMusicGenres: ["house_tech_house"],
              creatorMusicGenres: ["electronic_house_tech_house"],
            },
          },
          {
            id: "house_melodic_afro",
            group: "genres",
            filterName: "Melodic, Afro",
            count: 35,
            apiTargets: {
              communityMusicGenres: ["house_melodic_afro"],
              creatorMusicGenres: ["electronic_house_melodic_afro"],
            },
          },
        ],
      },
      {
        id: "edm",
        filterName: "EDM",
        count: 225,
        group: "genres",
        apiTargets: {
          communityMusicGenres: ["edm"],
          creatorMusicGenres: ["electronic_edm"],
        },
      },
      {
        id: "drum_and_bass",
        filterName: "D&B",
        count: 44,
        group: "genres",
        apiTargets: {
          communityMusicGenres: ["drum_and_bass"],
          creatorMusicGenres: ["electronic_drum_and_bass"],
        },
      },
      {
        id: "bass",
        filterName: "Bass",
        count: 5,
        group: "genres",
        apiTargets: {
          communityMusicGenres: ["bass"],
          creatorMusicGenres: ["electronic_bass"],
        },
      },
      {
        id: "psy_trance",
        filterName: "Psy, Trance",
        count: 16,
        group: "genres",
        apiTargets: {
          communityMusicGenres: ["psy_trance"],
          creatorMusicGenres: ["electronic_psy_trance"],
        },
      },
      {
        id: "dubstep",
        filterName: "Dubstep",
        count: 16,
        group: "genres",
        apiTargets: {
          communityMusicGenres: ["dubstep"],
          creatorMusicGenres: ["electronic_dubstep"],
        },
      },
    ],
  },
  {
    id: "countries",
    title: "Countries of Following",
    filters: [
      { id: "US", group: "countries", filterName: "US", count: 140 },
      { id: "Canada", group: "countries", filterName: "Canada", count: 155 },
      { id: "UK", group: "countries", filterName: "UK", count: 105 },
    ],
  },
  {
    id: "additional-topics",
    title: "Additional Topics",
    filters: [
      {
        id: "ibiza",
        group: "addTopics",
        filterName: "Ibiza",
        count: 328,
        apiTargets: { communityThemeTopics: ["ibiza"] },
      },
      {
        id: "meme",
        group: "addTopics",
        filterName: "Meme",
        count: 328,
        apiTargets: { communityThemeTopics: ["meme"] },
      },
      {
        id: "dancing",
        group: "addTopics",
        filterName: "Dancing",
        count: 328,
        apiTargets: { communityThemeTopics: ["dancing"] },
      },
      {
        id: "dance",
        group: "addTopics",
        filterName: "Dance",
        count: 328,
        apiTargets: { creatorContentFocus: ["music_dance"] },
      },
      {
        id: "lipsync",
        group: "addTopics",
        filterName: "Lipsync",
        count: 328,
        apiTargets: { creatorContentFocus: ["music_lipsync"] },
      },
      {
        id: "reactions",
        group: "addTopics",
        filterName: "Reactions",
        count: 328,
        apiTargets: { creatorContentFocus: ["music_reactions"] },
      },
    ],
  },
];
