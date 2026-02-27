import type {
  fieldsConfig,
  IPromoDetailsModel,
  TDetailsField,
  TPromoStatus,
} from "../types/promos.types";

import plattformMulti from "@/assets/plattform-social_medias/plattform_multi.svg";
import plattformInstagram from "@/assets/plattform-social_medias/plattform_instagram.svg";
import plattformTiktok from "@/assets/plattform-social_medias/plattform_tiktok.svg";
import plattformSpotify from "@/assets/plattform-social_medias/plattform_spotify.svg";
import plattformFacebook from "@/assets/plattform-social_medias/plattform_facebook.svg";
import plattformSoundclound from "@/assets/plattform-social_medias/plattform_soundcloud.svg";
import plattformYoutube from "@/assets/plattform-social_medias/plattform_youtube.svg";
import plattformPress from "@/assets/plattform-social_medias/plattform_press.svg";

const NEW_PROMOS_FIELDS: fieldsConfig = {
  instagram: [
    { key: "username", label: "Instagram", icon: plattformInstagram },
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
    { key: "username", label: "TikTok", icon: plattformTiktok },
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
    { key: "username", label: "YouTube", icon: plattformYoutube },
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
    { key: "username", label: "Facebook", icon: plattformFacebook },
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
    { key: "username", label: "Spotify", icon: plattformSpotify },
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
    { key: "username", label: "Press", icon: plattformPress },
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
    { key: "username", label: "SoundCloud", icon: plattformSoundclound },
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
    { key: "username", label: "Multi Promo", icon: plattformMulti },
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
    { key: "username", label: "Instagram", icon: plattformInstagram },
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
    { key: "username", label: "TikTok", icon: plattformTiktok },
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
    { key: "username", label: "YouTube", icon: plattformYoutube },
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
    { key: "username", label: "Facebook", icon: plattformFacebook },
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
    { key: "username", label: "Spotify", icon: plattformSpotify },
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
    { key: "username", label: "Press", icon: plattformPress },
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
    { key: "username", label: "SoundCloud", icon: plattformSoundclound },
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
    { key: "username", label: "Multi Promo", icon: plattformMulti },
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
    { key: "username", label: "Instagram", icon: plattformInstagram },
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
    { key: "username", label: "TikTok", icon: plattformTiktok },
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
    { key: "username", label: "YouTube", icon: plattformYoutube },
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
    { key: "username", label: "Facebook", icon: plattformFacebook },
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
    { key: "username", label: "Spotify", icon: plattformSpotify },
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
    { key: "username", label: "Press", icon: plattformPress },
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
    { key: "username", label: "SoundCloud", icon: plattformSoundclound },
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
    { key: "username", label: "Multi Promo", icon: plattformMulti },
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
