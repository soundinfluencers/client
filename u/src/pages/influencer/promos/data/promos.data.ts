import type {
  fieldsConfig,
  IPromoDetailsModel,
  TDetailsField,
  TPromoStatus,
} from "../types/promos.types";

const NEW_PROMOS_FIELDS: fieldsConfig = {
  instagram: [
    { key: "username", label: "Instagram" },
    { key: "clientName", label: "Client" },
    {
      key: "mainLink",
      label: "Videolink",
      linkable: true,
    },
    {
      key: "description",
      label: "Description",
      copyable: true,
    },
    {
      key: "taggedLink",
      label: "Story link",
      copyable: true,
    },
    { key: "taggedUser", label: "Story tag" },
    { key: "dateRequest", label: "Date request" },
    { key: "additionalBrief", label: "Additional brief" },
  ],
  tiktok: [
    { key: "username", label: "TikTok" },
    { key: "clientName", label: "Client" },
    {
      key: "mainLink",
      label: "Videolink",
      linkable: true,
    },
    {
      key: "description",
      label: "Description",
      copyable: true,
    },
    {
      key: "taggedLink",
      label: "Story link",
      copyable: true,
    },
    { key: "taggedUser", label: "Story tag" },
    { key: "dateRequest", label: "Date request" },
    { key: "additionalBrief", label: "Additional brief" },
  ],
  youtube: [
    { key: "username", label: "YouTube" },
    { key: "clientName", label: "Client" },
    {
      key: "mainLink",
      label: "Videolink",
      linkable: true,
    },
    {
      key: "description",
      label: "Description",
      copyable: true,
    },
    {
      key: "taggedLink",
      label: "Story link",
      copyable: true,
    },
    { key: "taggedUser", label: "Story tag" },
    { key: "dateRequest", label: "Date request" },
    { key: "additionalBrief", label: "Additional brief" },
  ],
  facebook: [
    { key: "username", label: "Facebook" },
    { key: "clientName", label: "Client" },
    {
      key: "mainLink",
      label: "Videolink",
      linkable: true,
    },
    {
      key: "description",
      label: "Description",
      copyable: true,
    },
    {
      key: "taggedLink",
      label: "Story link",
      copyable: true,
    },
    { key: "taggedUser", label: "Story tag" },
    { key: "dateRequest", label: "Date request" },
    { key: "additionalBrief", label: "Additional brief" },
  ],
  spotify: [
    { key: "username", label: "Spotify" },
    { key: "clientName", label: "Client" },
    {
      key: "mainLink",
      label: "Spotify Track link",
      linkable: true,
    },
    // {
    //   key: "description",
    //   label: "Description",
    //   copyable: true,
    // },
    // {
    //   key: "taggedLink",
    //   label: "Story link",
    //   copyable: true,
    // },
    // { key: "taggedUser", label: "Story tag" },
    { key: "dateRequest", label: "Date request" },
    { key: "additionalBrief", label: "Additional brief" },
  ],
  press: [
    { key: "username", label: "Press" },
    { key: "clientName", label: "Client" },
    {
      key: "mainLink",
      label: "Press link",
      linkable: true,
    },
    // {
    //   key: "description",
    //   label: "Description",
    //   copyable: true,
    // },
    // {
    //   key: "taggedLink",
    //   label: "Story link",
    //   copyable: true,
    // },
    // { key: "taggedUser", label: "Story tag" },
    { key: "dateRequest", label: "Date request" },
    { key: "additionalBrief", label: "Additional brief" },
  ],
  soundcloud: [
    { key: "username", label: "SoundCloud" },
    { key: "clientName", label: "Client" },
    {
      key: "mainLink",
      label: "SoundCloud Track link",
      linkable: true,
    },
    // {
    //   key: "description",
    //   label: "Description",
    //   copyable: true,
    // },
    // {
    //   key: "taggedLink",
    //   label: "Story link",
    //   copyable: true,
    // },
    // { key: "taggedUser", label: "Story tag" },
    { key: "dateRequest", label: "Date request" },
    { key: "additionalBrief", label: "Additional brief" },
  ],
  multipromo: [
    { key: "username", label: "Multi Promo" },
    { key: "clientName", label: "Client" },
    {
      key: "mainLink",
      label: "Videolink",
    },
    {
      key: "description",
      label: "Description",
      copyable: true,
    },
    {
      key: "taggedLink",
      label: "Story link",
      copyable: true,
    },
    { key: "taggedUser", label: "Story tag" },
    { key: "dateRequest", label: "Date request" },
    { key: "additionalBrief", label: "Additional brief" },
  ],
};

const DISTRIBUTING_FIELDS: fieldsConfig = {
  instagram: [
    { key: "username", label: "Instagram" },
    { key: "clientName", label: "Client" },
    {
      key: "mainLink",
      label: "Videolink",
      linkable: true,
    },
    {
      key: "description",
      label: "Description",
      copyable: true,
    },
    {
      key: "taggedLink",
      label: "Story link",
      copyable: true,
    },
    { key: "taggedUser", label: "Story tag" },
    { key: "dateRequest", label: "Date request" },
    { key: "additionalBrief", label: "Additional brief" },
  ],
  tiktok: [
    { key: "username", label: "TikTok" },
    { key: "clientName", label: "Client" },
    {
      key: "mainLink",
      label: "Videolink",
      linkable: true,
    },
    {
      key: "description",
      label: "Description",
      copyable: true,
    },
    {
      key: "taggedLink",
      label: "Story link",
      copyable: true,
    },
    { key: "taggedUser", label: "Story tag" },
    { key: "dateRequest", label: "Date request" },
    { key: "additionalBrief", label: "Additional brief" },
  ],
  youtube: [
    { key: "username", label: "YouTube" },
    { key: "clientName", label: "Client" },
    {
      key: "mainLink",
      label: "Videolink",
      linkable: true,
    },
    {
      key: "description",
      label: "Description",
      copyable: true,
    },
    {
      key: "taggedLink",
      label: "Story link",
      copyable: true,
    },
    { key: "taggedUser", label: "Story tag" },
    { key: "dateRequest", label: "Date request" },
    { key: "additionalBrief", label: "Additional brief" },
  ],
  facebook: [
    { key: "username", label: "Facebook" },
    { key: "clientName", label: "Client" },
    {
      key: "mainLink",
      label: "Videolink",
      linkable: true,
    },
    {
      key: "description",
      label: "Description",
      copyable: true,
    },
    {
      key: "taggedLink",
      label: "Story link",
      copyable: true,
    },
    { key: "taggedUser", label: "Story tag" },
    { key: "dateRequest", label: "Date request" },
    { key: "additionalBrief", label: "Additional brief" },
  ],
  spotify: [
    { key: "username", label: "Spotify" },
    { key: "clientName", label: "Client" },
    {
      key: "mainLink",
      label: "Spotify Track link",
      linkable: true,
    },
    { key: "dateRequest", label: "Date request" },
    { key: "additionalBrief", label: "Additional brief" },
  ],
  press: [
    { key: "username", label: "Press" },
    { key: "clientName", label: "Client" },
    {
      key: "mainLink",
      label: "Press link",
      linkable: true,
    },
    { key: "dateRequest", label: "Date request" },
    { key: "additionalBrief", label: "Additional brief" },
  ],
  soundcloud: [
    { key: "username", label: "SoundCloud" },
    { key: "clientName", label: "Client" },
    {
      key: "mainLink",
      label: "SoundCloud Track link",
      linkable: true,
    },
    { key: "dateRequest", label: "Date request" },
    { key: "additionalBrief", label: "Additional brief" },
  ],
  multipromo: [
    { key: "username", label: "Multi Promo" },
    { key: "clientName", label: "Client" },
    {
      key: "mainLink",
      label: "Videolink",
    },
    {
      key: "description",
      label: "Description",
      copyable: true,
    },
    {
      key: "taggedLink",
      label: "Story link",
      copyable: true,
    },
    { key: "taggedUser", label: "Story tag" },
    { key: "dateRequest", label: "Date request" },
    { key: "additionalBrief", label: "Additional brief" },
  ],
};

const COMPLETED_FIELDS: fieldsConfig = {
  instagram: [
    { key: "username", label: "Instagram" },
    { key: "clientName", label: "Client" },
    {
      key: "postLink",
      label: "Post link",
      linkable: true,
    },
    {
      key: "reward",
      label: "Reward",
      format: (v: number) => `${v}€`,
    },
  ],
  tiktok: [
    { key: "username", label: "TikTok" },
    { key: "clientName", label: "Client" },
    {
      key: "postLink",
      label: "Post link",
      linkable: true,
    },
    {
      key: "reward",
      label: "Reward",
      format: (v: number) => `${v}€`,
    },
  ],
  youtube: [
    { key: "username", label: "YouTube" },
    { key: "clientName", label: "Client" },
    {
      key: "postLink",
      label: "Post link",
      linkable: true,
    },
    {
      key: "reward",
      label: "Reward",
      format: (v: number) => `${v}€`,
    },
  ],
  facebook: [
    { key: "username", label: "Facebook" },
    { key: "clientName", label: "Client" },
    {
      key: "postLink",
      label: "Post link",
      linkable: true,
    },
    {
      key: "reward",
      label: "Reward",
      format: (v: number) => `${v}€`,
    },
  ],
  spotify: [
    { key: "username", label: "Spotify" },
    { key: "clientName", label: "Client" },
    {
      key: "postLink",
      label: "Playlist link",
      linkable: true,
    },
    {
      key: "reward",
      label: "Reward",
      format: (v: number) => `${v}€`,
    },
  ],
  press: [
    { key: "username", label: "Press" },
    { key: "clientName", label: "Client" },
    {
      key: "postLink",
      label: "Post link",
      linkable: true,
    },
    {
      key: "reward",
      label: "Reward",
      format: (v: number) => `${v}€`,
    },
  ],
  soundcloud: [
    { key: "username", label: "SoundCloud" },
    { key: "clientName", label: "Client" },
    {
      key: "postLink",
      label: "Repost link",
      linkable: true,
    },
    {
      key: "reward",
      label: "Reward",
      format: (v: number) => `${v}€`,
    },
  ],
  multipromo: [
    { key: "username", label: "Multi Promo" },
    { key: "clientName", label: "Client" },
    {
      key: "postLink",
      label: "Post link",
    },
    {
      key: "reward",
      label: "Reward",
      format: (v: number) => `${v}€`,
    },
  ],
};

export const getPromoFields = (
  promo: IPromoDetailsModel,
  status: TPromoStatus,
): TDetailsField[] => {
  if (status === "completed") return COMPLETED_FIELDS[promo.accountSocialMedia];
  if (status === "distributing")
    return DISTRIBUTING_FIELDS[promo.accountSocialMedia];

  return NEW_PROMOS_FIELDS[promo.accountSocialMedia];
};
