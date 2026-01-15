import type { ICheckboxButton } from "../types/checkbox-buttons.types";

export const MUSIC_GENERS_DATA: ICheckboxButton[] = [
  {
    id: "techno",
    label: "Techno",
    value: "techno",
    children: [
      {
        id: "techno-melodic",
        label: "Melodic, Minimal", //TODO: send label to backend as "Melodic, Minimal"
        value: "melodic_minimal",
      },
      {
        id: "techno-hard",
        label: "Hard, Peak",
        value: "hard_peak",
      },
    ],
  },
  {
    id: "house",
    label: "House",
    value: "house",
    children: [
      {
        id: "tech-house",
        label: "Tech House",
        value: "tech_house",
      },
      { id: "melodic-house", label: "Melodic House", value: "melodic_house" },
      { id: "afro-house", label: "Afro House", value: "afro_house" },
    ],
  },
  {
    id: "edm",
    label: "EDM",
    value: "edm",
  },
  {
    id: "d&b",
    label: "D&B",
    value: "d&b",
  },
  { id: "bass", label: "Bass", value: "bass" },
  { id: "psy-trance", label: "Psy, Trance", value: "psy_trance" },
  { id: "dubstep", label: "Dubstep", value: "dubstep" },
  { id: "pop", label: "Pop", value: "pop" },
  { id: "hip-hop", label: "Hip-Hop", value: "hip_hop" },
];