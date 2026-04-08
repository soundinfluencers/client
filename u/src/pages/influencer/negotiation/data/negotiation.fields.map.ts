import type { FieldsConfig } from "@/pages/influencer/negotiation/types/negotiation.config.types.ts";

export const NEGOTIATION_ACCOUNT_CARD_FIELDS: FieldsConfig = {
  instagram: [
    { key: "username", label: "Account name:", type: "text" },
    { key: "profileLink", label: "Link:", type: "link" },
    { key: "followers", label: "Followers:", type: "text" },
    { key: "countries", label: "Audience countries:", type: "countries" },
    { key: "initialPrice", label: "Price:", type: "price" },
    // creatorCategories only for creator
    { key: "creatorCategories", label: "Creator categories:", type: "stringChips", when: { category: "creator" } },
    // musicGenres and topics for community
    { key: "musicGenres", label: "Music genres:", type: "chips", when: { category: "community" } },
    { key: "categories", label: "Theme topics:", type: "chips", when: { category: "community" } },
  ],

  tiktok: [
    { key: "username", label: "Account name:", type: "text" },
    { key: "profileLink", label: "Link:", type: "link" },
    { key: "followers", label: "Followers:", type: "text" },
    { key: "countries", label: "Audience countries:", type: "countries" },
    { key: "initialPrice", label: "Price:", type: "price" },
    // creatorCategories only for creator
    { key: "creatorCategories", label: "Creator categories:", type: "stringChips", when: { category: "creator" } },
    // musicGenres and topics for community
    { key: "musicGenres", label: "Music genres:", type: "chips", when: { category: "community" } },
    { key: "categories", label: "Theme topics:", type: "chips", when: { category: "community" } },
  ],

  youtube: [
    { key: "username", label: "Account name:", type: "text" },
    { key: "profileLink", label: "Link:", type: "link" },
    { key: "followers", label: "Followers:", type: "text" },
    { key: "countries", label: "Audience countries:", type: "countries" },
    { key: "initialPrice", label: "Price:", type: "price" },
    // creatorCategories only for creator
    { key: "creatorCategories", label: "Creator categories:", type: "stringChips", when: { category: "creator" } },
    // musicGenres and topics for community
    { key: "musicGenres", label: "Music genres:", type: "chips", when: { category: "community" } },
    { key: "categories", label: "Theme topics:", type: "chips", when: { category: "community" } },
  ],

  spotify: [
    // spotify/soundcloud: only for community
    { key: "username", label: "Account name:", type: "text" },
    { key: "profileLink", label: "Link:", type: "link" },
    { key: "followers", label: "Followers:", type: "text" },
    { key: "musicGenres", label: "Music genres:", type: "chips" },
    { key: "initialPrice", label: "Price:", type: "price" },
  ],

  soundcloud: [
    { key: "username", label: "Account name:", type: "text" },
    { key: "profileLink", label: "Link:", type: "link" },
    { key: "followers", label: "Followers:", type: "text" },
    { key: "musicGenres", label: "Music genres:", type: "chips" },
    { key: "initialPrice", label: "Price:", type: "price" },
  ],

  facebook: [
    // facebook: community
    { key: "username", label: "Account name:", type: "text" },
    { key: "profileLink", label: "Link:", type: "link" },
    { key: "followers", label: "Followers:", type: "text" },
    { key: "musicGenres", label: "Music genres:", type: "chips" },
    { key: "categories", label: "Theme topics:", type: "chips", when: { category: "community" } },
    { key: "countries", label: "Audience countries:", type: "countries" },
    { key: "initialPrice", label: "Price:", type: "price" },
  ],

  press: [
    { key: "username", label: "Account name:", type: "text" },
    { key: "profileLink", label: "Link:", type: "link" },
    { key: "musicGenres", label: "Music genres:", type: "chips" },
    { key: "initialPrice", label: "Price:", type: "price" },
  ],
};
