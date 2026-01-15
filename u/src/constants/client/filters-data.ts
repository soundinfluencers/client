export const filterArr = [
  {
    id: "social-platforms-1",
    title: "Social Media Platforms",
    filters: [
      { id: "instagram", filterName: "Instagram", count: 328 },
      { id: "tiktok", filterName: "TikTok", count: 328 },
      { id: "spotify", filterName: "Spotify", count: 328 },
      { id: "facebook", filterName: "Facebook", count: 328 },
      { id: "soundcloud", filterName: "SoundCLoud", count: 328 },
      { id: "youtube", filterName: "YouTube", count: 328 },
    ],
  },
  {
    id: "music-genre",
    title: "Music Genre",
    AndOrFlag: [{ method: "And" }, { method: "Or" }],
    filters: [
      {
        id: "techno",
        filterName: "Techno",
        count: 328,
        children: [
          {
            id: "melodic-minimal",
            filterName: "Melodic, Minimal",
            count: 140,
          },
          {
            id: "hard-peak",
            filterName: "Hard, Peak",
            count: 155,
          },
        ],
      },
      {
        id: "house",
        filterName: "House",
        count: 225,
        children: [
          {
            id: "tech-house",
            filterName: "Tech House",
            count: 105,
          },
          {
            id: "melodic-afro",
            filterName: "Melodic, Afro",
            count: 35,
          },
        ],
      },
    ],
  },
  {
    id: "social-platforms-2",
    title: "Social Media Platforms",
    filters: [
      { id: "instagram-2", filterName: "Instagram", count: 328 },
      { id: "tiktok-2", filterName: "TikTok", count: 328 },
      { id: "spotify-2", filterName: "Spotify", count: 328 },
      { id: "facebook-2", filterName: "Facebook", count: 328 },
      { id: "soundcloud-2", filterName: "SoundCLoud", count: 328 },
      { id: "youtube-2", filterName: "YouTube", count: 328 },
    ],
  },
  {
    id: "social-platforms-3",
    title: "Social Media Platforms",
    filters: [
      { id: "instagram-3", filterName: "Instagram", count: 328 },
      { id: "tiktok-3", filterName: "TikTok", count: 328 },
      { id: "spotify-3", filterName: "Spotify", count: 328 },
      { id: "facebook-3", filterName: "Facebook", count: 328 },
      { id: "soundcloud-3", filterName: "SoundCLoud", count: 328 },
      { id: "youtube-3", filterName: "YouTube", count: 328 },
    ],
  },
];
