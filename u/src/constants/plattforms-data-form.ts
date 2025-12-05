import type { PlattformsDataFormProps } from "../types/form/plattforms-data-form.types";

export const PlattformsDataForm: PlattformsDataFormProps[] = [
  {
    plattform: "spotify",
    headInput: {
      name: "Campaign Name",
      placeholder: "Enter campaign name",
    },
    inputs: [
      {
        name: "Spotify track link*",
        placeholder: "https://",
      },
      {
        name: "Track title",
        placeholder: "Artist - song title",
      },
      {
        name: "Additional brief",
        placeholder: "Enter additional brief",
      },
    ],
    contentTitle: "Song",
  },
  {
    plattform: "soundclound",
    headInput: {
      name: "Campaign Name",
      placeholder: "Enter campaign name",
    },
    inputs: [
      {
        name: "Soundclound track link*",
        placeholder: "https://",
      },
      {
        name: "Track title",
        placeholder: "Artist - song title",
      },
      {
        name: "Additional brief",
        placeholder: "Enter additional brief",
      },
    ],
    contentTitle: "Song",
  },
  {
    plattform: "press",
    headInput: {
      name: "Campaign Name",
      placeholder: "Enter campaign name",
    },
    inputs: [
      {
        name: "Link to music, events, news**",
        placeholder: "https://",
      },
      {
        name: "Link to artwork & press shots",
        placeholder: "https://",
      },
    ],
    textAreas: [
      {
        name: "Additional brief",
        placeholder: "Enter additional brief",
      },
    ],

    contentTitle: "Press release",
  },
];
