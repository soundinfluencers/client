import type { NestedOption } from "../types/checkbox-buttons.types";

export const MUSIC_GENRES_COMMUNITY: NestedOption[] = [
  {
    value: "techno",
    label: "Techno",
    children: [
      { value: "techno_melodic_minimal", label: "Melodic, Minimal" },
      { value: "techno_hard_peak", label: "Hard, Peak" },
    ],
  },
  {
    value: "house",
    label: "House",
    children: [
      { value: "house_tech_house", label: "Tech House" },
      { value: "house_melodic_afro", label: "Melodic, Afro" },
    ],
  },
  { value: "edm", label: "EDM" },
  { value: "drum_and_bass", label: "D&B" },
  { value: "bass", label: "Bass" },
  { value: "psy_trance", label: "Psy, Trance" },
  { value: "dubstep", label: "Dubstep" },
  { value: "hip_hop", label: "Hip-hop" },
  { value: "pop", label: "Pop" },
];

export const MUSIC_GENRES_CREATOR: NestedOption[] = [
  {
    value: "electronic_music",
    label: "Electronic Music",
    children: [
      {
        value: "techno",
        label: "Techno",
        children: [
          { value: "electronic_techno_melodic_minimal", label: "Melodic, Minimal" },
          { value: "electronic_techno_hard_peak", label: "Hard, Peak" },
        ],
      },
      {
        value: "house",
        label: "House",
        children: [
          { value: "electronic_house_tech_house", label: "Tech House" },
          { value: "electronic_house_melodic_afro", label: "Melodic, Afro" },
        ],
      },
      { value: "electronic_edm", label: "EDM" },
      { value: "electronic_drum_and_bass", label: "D&B" },
      { value: "electronic_bass", label: "Bass" },
      { value: "electronic_psy_trance", label: "Psy, Trance" },
      { value: "electronic_dubstep", label: "Dubstep" },
    ],
  },
  {
    value: "mainstream_music",
    label: "Mainstream Music",
    children: [
      { value: "mainstream_pop", label: "Pop" },
      { value: "mainstream_hip_hop", label: "Hip-hop" },
      { value: "mainstream_arabic", label: "Arabic" },
      { value: "mainstream_k_pop", label: "K-Pop" },
      { value: "mainstream_metal_rock", label: "Metal/Rock" },
      { value: "mainstream_latin", label: "Latin" },
    ],
  },
];
