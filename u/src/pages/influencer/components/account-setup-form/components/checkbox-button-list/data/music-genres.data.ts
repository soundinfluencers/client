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
        value: "Melodic, Minimal",
      },
      {
        id: "techno-hard",
        label: "Hard, Peak",
        value: "Hard, Peak",
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
        value: "Tech House",
      },
      { id: "melodic", label: "Melodic", value: "Melodic" },
      { id: "afro-house", label: "Afro House", value: "Afro House" },
    ],
  },
  {
    id: "edm",
    label: "EDM",
    value: "EDM",
  },
  {
    id: "d&b",
    label: "D&B",
    value: "D&B",
  },
  { id: "bass", label: "Bass", value: "Bass" },
  { id: "psy-trance", label: "Psy, Trance", value: "Psy, Trance" },
  { id: "dubstep", label: "Dubstep", value: "Dubstep" },
  { id: "pop", label: "Pop", value: "Pop" },
  { id: "hip-hop", label: "Hip-Hop", value: "Hip-hop" },
];