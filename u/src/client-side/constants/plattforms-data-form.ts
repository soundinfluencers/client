import type { IPlattformsDataForm } from "@/types/client/form-clients/plattforms-data-form.types";

export const PlattformsDataForm: IPlattformsDataForm = {
  formType: "platform",
  headInput: {
    id: "campaignName",
    name: "Campaign Name",
    placeholder: "Enter campaign name",
  },
  mainPlatform: {
    inputs: [
      {
        id: "Contentlink",
        name: "Content link",
        placeholder: "https://",
      },
      {
        id: "Storytag",
        name: "Story tag",
        placeholder: "@tagged user",
      },
      {
        id: "Storylink",
        name: "Story link",
        placeholder: "https://",
      },
    ],
    textAreas: [
      {
        id: "additionalBrief",
        name: "Additional brief",
        placeholder: "Enter additional brief",
      },
    ],
    contentTitle: "Post brief",
  },
  musicPlatform: {
    inputs: [
      {
        id: "TrackLink",
        name: "Track link",
        placeholder: "https://",
      },
      {
        id: "trackTitle",
        name: "Track title",
        placeholder: "Artist - song title",
      },
      {
        id: "additionalBrief",
        name: "Additional brief",
        placeholder: "Enter additional brief",
      },
    ],
    contentTitle: "Song",
  },
  pressPlatform: {
    inputs: [
      {
        id: "musicLinks",
        name: "Link to music, events, news",
        placeholder: "https://",
      },
      {
        id: "artworkLinks",
        name: "Link to artwork & press shots",
        placeholder: "https://",
      },
    ],
    textAreas: [
      {
        id: "additionalBrief",
        name: "Additional brief",
        placeholder: "Enter additional brief",
      },
    ],
    contentTitle: "Press release",
  },
};

export const platformFormsMap = {
  main: PlattformsDataForm.mainPlatform,
  music: PlattformsDataForm.musicPlatform,
  press: PlattformsDataForm.pressPlatform,
};

export const musicPlatforms = ["spotify", "soundcloud"];
export const mainPlatforms = ["tiktok", "youtube", "instagram", "facebook"];
export const pressPlatforms = ["press"];
