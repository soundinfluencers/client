import type { NestedOption } from "../types/checkbox-buttons.types";

export const CONTENT_FOCUS_OPTIONS: NestedOption[] = [
  {
    value: "music",
    label: "Music",
    children: [
      { value: "music_dance", label: "Dance" },
      { value: "music_lipsync", label: "Lipsync" },
      { value: "music_reactions", label: "Reactions" },
      { value: "music_lyrics", label: "Lyrics" },
    ],
  },
  {
    value: "entertainment",
    label: "Entertainment",
    children: [
      { value: "entertainment_lifestyle", label: "Lifestyle" },
      { value: "entertainment_fashion", label: "Fashion" },
      { value: "entertainment_fitness_sport", label: "Fitness/Sport" },
      { value: "entertainment_beauty", label: "Beauty" },
      { value: "entertainment_travel", label: "Travel" },
      { value: "entertainment_family", label: "Family" },
      { value: "entertainment_comedy", label: "Comedy" },
      { value: "entertainment_cosplay", label: "Cosplay" },
      { value: "entertainment_food", label: "Food" },
      { value: "entertainment_art", label: "Art" },
    ],
  },
];
