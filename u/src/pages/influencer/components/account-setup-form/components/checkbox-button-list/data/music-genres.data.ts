import type { ICheckboxButton } from "../types/checkbox-buttons.types";

export const MUSIC_GENRES_DATA: ICheckboxButton[] = [
  {
    id: "techno",
    label: "Techno",
    value: "Techno",
    children: [
      {
        id: "techno-melodic",
        label: "Melodic, Minimal",
        value: "Melodic, minimal",
        // value: "melodic_minimal",
      },
      {
        id: "techno-hard",
        label: "Hard, Peak",
        value: "Hard, peak",
        // value: "hard_peak",
      },
    ],
  },
  {
    id: "house",
    label: "House",
    value: "House",
    children: [
      {
        id: "tech-house",
        label: "Tech House",
        value: "Tech house",
      },
      { id: "melodic-house", label: "Melodic House", value: "Melodic house" },
      { id: "afro-house", label: "Afro House", value: "Afro house" },
    ],
  },
  {
    id: "edm",
    label: "EDM",
    value: "Edm",
  },
  {
    id: "d&b",
    label: "D&B",
    value: "D&b",
  },
  { id: "bass", label: "Bass", value: "Bass" },
  { id: "psy-trance", label: "Psy, Trance", value: "Psy, trance" },
  { id: "dubstep", label: "Dubstep", value: "Dubstep" },
  { id: "pop", label: "Pop", value: "Pop" },
  { id: "hip-hop", label: "Hip-Hop", value: "Hip-hop" },
];