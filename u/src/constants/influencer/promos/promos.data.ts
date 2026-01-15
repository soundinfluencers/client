import type {
  filedsConfig,
  IInfluencerPromo,
  TDetailsField,
  TPromoStatus,
} from "../../../types/influencer/promos/promos.types";

const NEW_PROMOS_FIELDS: filedsConfig = {
  instagram: [
    { key: "socialMediaUsername", label: "Instagram" },
    { key: "client", label: "Client" },
    {
      key: "videoLink",
      label: "Videolink",
    },
    {
      key: "postDescription",
      label: "Description",
      copyable: true,
    },
    {
      key: "storyLink",
      label: "Story link",
      copyable: true,
    },
    { key: "storyTag", label: "Story tag" },
    { key: "dateRequest", label: "Date request" },
    { key: "additionalBrief", label: "Additional brief" },
  ],
  tiktok: [
    { key: "socialMediaUsername", label: "TikTok" },
    { key: "client", label: "Client" },
    {
      key: "videoLink",
      label: "Videolink",
    },
    {
      key: "postDescription",
      label: "Description",
      copyable: true,
    },
    {
      key: "storyLink",
      label: "Story link",
      copyable: true,
    },
    { key: "storyTag", label: "Story tag" },
    { key: "dateRequest", label: "Date request" },
    { key: "additionalBrief", label: "Additional brief" },
  ],
  youtube: [
    { key: "socialMediaUsername", label: "YouTube" },
    { key: "client", label: "Client" },
    {
      key: "videoLink",
      label: "Videolink",
    },
    {
      key: "postDescription",
      label: "Description",
      copyable: true,
    },
    {
      key: "storyLink",
      label: "Story link",
      copyable: true,
    },
    { key: "storyTag", label: "Story tag" },
    { key: "dateRequest", label: "Date request" },
    { key: "additionalBrief", label: "Additional brief" },
  ],
  facebook: [
    { key: "socialMediaUsername", label: "Facebook" },
    { key: "client", label: "Client" },
    {
      key: "videoLink",
      label: "Videolink",
    },
    {
      key: "postDescription",
      label: "Description",
      copyable: true,
    },
    {
      key: "storyLink",
      label: "Story link",
      copyable: true,
    },
    { key: "storyTag", label: "Story tag" },
    { key: "dateRequest", label: "Date request" },
    { key: "additionalBrief", label: "Additional brief" },
  ],
  spotify: [
    { key: "socialMediaUsername", label: "Spotify" },
    { key: "client", label: "Client" },
    {
      key: "videoLink",
      label: "Videolink",
    },
    {
      key: "postDescription",
      label: "Description",
      copyable: true,
    },
    {
      key: "storyLink",
      label: "Story link",
      copyable: true,
    },
    { key: "storyTag", label: "Story tag" },
    { key: "dateRequest", label: "Date request" },
    { key: "additionalBrief", label: "Additional brief" },
  ],
  press: [
    { key: "socialMediaUsername", label: "Press" },
    { key: "client", label: "Client" },
    {
      key: "videoLink",
      label: "Videolink",
    },
    {
      key: "postDescription",
      label: "Description",
      copyable: true,
    },
    {
      key: "storyLink",
      label: "Story link",
      copyable: true,
    },
    { key: "storyTag", label: "Story tag" },
    { key: "dateRequest", label: "Date request" },
    { key: "additionalBrief", label: "Additional brief" },
  ],
  soundcloud: [
    { key: "socialMediaUsername", label: "SoundCloud" },
    { key: "client", label: "Client" },
    {
      key: "videoLink",
      label: "Videolink",
    },
    {
      key: "postDescription",
      label: "Description",
      copyable: true,
    },
    {
      key: "storyLink",
      label: "Story link",
      copyable: true,
    },
    { key: "storyTag", label: "Story tag" },
    { key: "dateRequest", label: "Date request" },
    { key: "additionalBrief", label: "Additional brief" },
  ],
  multipromo: [
    { key: "socialMediaUsername", label: "Multi Promo" },
    { key: "client", label: "Client" },
    {
      key: "videoLink",
      label: "Videolink",
    },
    {
      key: "postDescription",
      label: "Description",
      copyable: true,
    },
    {
      key: "storyLink",
      label: "Story link",
      copyable: true,
    },
    { key: "storyTag", label: "Story tag" },
    { key: "dateRequest", label: "Date request" },
    { key: "additionalBrief", label: "Additional brief" },
  ],
};

const DISTRIBUTING_FIELDS: filedsConfig = {
  instagram: [
    { key: "socialMediaUsername", label: "Instagram" },
    { key: "client", label: "Client" },
    {
      key: "videoLink",
      label: "Videolink",
    },
    {
      key: "postDescription",
      label: "Description",
      copyable: true,
    },
    {
      key: "storyLink",
      label: "Story link",
      copyable: true,
    },
    { key: "storyTag", label: "Story tag" },
    { key: "dateRequest", label: "Date request" },
    { key: "additionalBrief", label: "Additional brief" },
  ],
  tiktok: [
    { key: "socialMediaUsername", label: "TikTok" },
    { key: "client", label: "Client" },
    {
      key: "videoLink",
      label: "Videolink",
    },
    {
      key: "postDescription",
      label: "Description",
      copyable: true,
    },
    {
      key: "storyLink",
      label: "Story link",
      copyable: true,

    },
    { key: "storyTag", label: "Story tag" },
    { key: "dateRequest", label: "Date request" },
    { key: "additionalBrief", label: "Additional brief" },
  ],
  youtube: [
    { key: "socialMediaUsername", label: "YouTube" },
    { key: "client", label: "Client" },
    {
      key: "videoLink",
      label: "Videolink",
    },
    {
      key: "postDescription",
      label: "Description",
      copyable: true,
    },
    {
      key: "storyLink",
      label: "Story link",
      copyable: true,
    },
    { key: "storyTag", label: "Story tag" },
    { key: "dateRequest", label: "Date request" },
    { key: "additionalBrief", label: "Additional brief" },
  ],
  facebook: [
    { key: "socialMediaUsername", label: "Facebook" },
    { key: "client", label: "Client" },
    {
      key: "videoLink",
      label: "Videolink",
    },
    {
      key: "postDescription",
      label: "Description",
      copyable: true,
    },
    {
      key: "storyLink",
      label: "Story link",
      copyable: true,
    },
    { key: "storyTag", label: "Story tag" },
    { key: "dateRequest", label: "Date request" },
    { key: "additionalBrief", label: "Additional brief" },
  ],
  spotify: [
    { key: "socialMediaUsername", label: "Spotify" },
    { key: "client", label: "Client" },
    {
      key: "videoLink",
      label: "Spotify Track link",
    },
    // {
    //   key: "postDescription",
    //   label: "Description",
    //   copyable: true,
    //   visible: false,
    // },
    // {
    //   key: "storyLink",
    //   label: "Story link",
    //   copyable: true,
    //   visible: false,
    // },
    // { key: "storyTag", label: "Story tag", visible: false },
    { key: "dateRequest", label: "Date request" },
    { key: "additionalBrief", label: "Additional brief" },
  ],
  press: [
    { key: "socialMediaUsername", label: "Press" },
    { key: "client", label: "Client" },
    {
      key: "videoLink",
      label: "Press link",
    },
    // {
    //   key: "postDescription",
    //   label: "Description",
    //   copyable: true,
    //   visible: false,
    // },
    // {
    //   key: "storyLink",
    //   label: "Story link",
    //   copyable: true,
    //   visible: false,
    // },
    // { key: "storyTag", label: "Story tag", visible: false },
    { key: "dateRequest", label: "Date request" },
    { key: "additionalBrief", label: "Additional brief" },
  ],
  soundcloud: [
    { key: "socialMediaUsername", label: "SoundCloud" },
    { key: "client", label: "Client" },
    {
      key: "videoLink",
      label: "SoundCloud Track link",
    },
    // {
    //   key: "postDescription",
    //   label: "Description",
    //   copyable: true,
    //   visible: false,
    // },
    // {
    //   key: "storyLink",
    //   label: "Story link",
    //   copyable: true,
    //   visible: false,
    // },
    // { key: "storyTag", label: "Story tag", visible: false },
    { key: "dateRequest", label: "Date request" },
    { key: "additionalBrief", label: "Additional brief" },
  ],
  multipromo: [
    { key: "socialMediaUsername", label: "Multi Promo" },
    { key: "client", label: "Client" },
    {
      key: "videoLink",
      label: "Videolink",
    },
    {
      key: "postDescription",
      label: "Description",
      copyable: true,
    },
    {
      key: "storyLink",
      label: "Story link",
      copyable: true,
    },
    { key: "storyTag", label: "Story tag" },
    { key: "dateRequest", label: "Date request" },
    { key: "additionalBrief", label: "Additional brief" },
  ],
};

const COMPLETED_FIELDS: filedsConfig = {
  instagram: [
    { key: "socialMediaUsername", label: "Instagram" },
    { key: "client", label: "Client" },
    {
      key: "videoLink",
      label: "Videolink",
    },
    {
      key: "reward",
      label: "Reward",
      format: (v: number) => `${v}€`,
    },
  ],
  tiktok: [
    { key: "socialMediaUsername", label: "TikTok" },
    { key: "client", label: "Client" },
    {
      key: "videoLink",
      label: "Videolink",
    },
    {
      key: "reward",
      label: "Reward",
      format: (v: number) => `${v}€`,
    },
  ],
  youtube: [
    { key: "socialMediaUsername", label: "YouTube" },
    { key: "client", label: "Client" },
    {
      key: "videoLink",
      label: "Videolink",
    },
    {
      key: "reward",
      label: "Reward",
      format: (v: number) => `${v}€`,
    },
  ],
  facebook: [
    { key: "socialMediaUsername", label: "Facebook" },
    { key: "client", label: "Client" },
    {
      key: "videoLink",
      label: "Videolink",
    },
    {
      key: "reward",
      label: "Reward",
      format: (v: number) => `${v}€`,
    },
  ],
  spotify: [
    { key: "socialMediaUsername", label: "Spotify" },
    { key: "client", label: "Client" },
    {
      key: "videoLink",
      label: "Videolink",
    },
    {
      key: "reward",
      label: "Reward",
      format: (v: number) => `${v}€`,
    },
  ],
  press: [
    { key: "socialMediaUsername", label: "Press" },
    { key: "client", label: "Client" },
    {
      key: "videoLink",
      label: "Videolink",
    },
    {
      key: "reward",
      label: "Reward",
      format: (v: number) => `${v}€`,
    },
  ],
  soundcloud: [
    { key: "socialMediaUsername", label: "SoundCloud" },
    { key: "client", label: "Client" },
    {
      key: "videoLink",
      label: "Videolink",
    },
    {
      key: "reward",
      label: "Reward",
      format: (v: number) => `${v}€`,
    },
  ],
  multipromo: [
    { key: "socialMediaUsername", label: "Multi Promo" },
    { key: "client", label: "Client" },
    {
      key: "videoLink",
      label: "Videolink",
    },
    {
      key: "reward",
      label: "Reward",
      format: (v: number) => `${v}€`,
    },
  ],
}

export const getPromoStatus = (promo: IInfluencerPromo): TPromoStatus => {
  if (promo.closedStatus === "closed") return "completed";
  if (promo.closedStatus === "open") return "distributing";
  return "new";
};

export const getPromoFields = (
  promo: IInfluencerPromo,
  status: TPromoStatus
): TDetailsField[] => {
  if (status === 'completed') return COMPLETED_FIELDS[promo.socialMedia];
  if (status === "distributing") return DISTRIBUTING_FIELDS[promo.socialMedia];

  return NEW_PROMOS_FIELDS[promo.socialMedia];
};