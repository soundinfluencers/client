import type { DropdownKey } from "../types/table-types";
import type { TableGroup } from "@/client-side/types/table-types";

export const columns = [
  "network",
  "followers",
  "postlink",
  "screenshot",
  "impressions",
  "likes",
  "comments",
  "saves",
  "shares",
] as const;

export const columnsStrategy = [
  "network",
  "followers",
  "date",
  "content",
  "description",
  "tag",
  "link",
  "brief",
] as const;

export const columnsProposals = [
  "network",
  "followers",
  "genres",
  "countries",
  "content",
  "description",
  "action",
] as const;

export const getColumnsStrategy = (flag: boolean) => {
  return flag ? columnsProposals : columnsStrategy;
};

export const getWidthColumn = (flag: boolean, isProposal: boolean) => {
  return flag
    ? {
        network: 185,
        followers: 96,
        date: 120,
        content: 130,
        description: 210,
        genres: 300,
        countries: 300,
        taggedUser: 160,
        taggedLink: 220,
        additionalBrief: 260,
        tracklink: 200,
        tracktitle: 200,
      }
    : isProposal
      ? {
          network: 185,
          followers: 96,
          date: 120,
          content: 150,
          description: 270,
          tracktitle: 270,
          taggedUser: 160,
          taggedLink: 220,
          additionalBrief: 260,
          tracklink: 200,
          action: 66,
        }
      : {
          network: 185,
          followers: 96,
          date: 120,
          content: 150,
          description: 311,
          taggedUser: 160,
          taggedLink: 220,
          additionalBrief: 260,
          tracklink: 200,
          tracktitle: 200,
        };
};

export type ColumnKey = keyof ReturnType<typeof getWidthColumn>;

// ---------- group-specific titles ----------
const baseTitles: Record<string, string> = {
  network: "Networks",
  followers: "Followers",
  postlink: "Post link",
  screenshot: "Screenshot",
  impressions: "Impressions",
  likes: "Likes",
  genres: "Genres",
  countries: "Top 5 Countries",
  comments: "Comments",
  saves: "Saves",
  shares: "Shares",
  date: "Req. date",
  content: "Content",
  description: "Post description",
  tag: "Story tag",
  link: "Story link",
  tracklink: "Track link",
  tracktitle: "Track Title",
  brief: "Additional brief",
  action: "Actions",
  artworkLink: "Artwork Link",
};

const titlesByGroup: Partial<
  Record<TableGroup, Partial<Record<string, string>>>
> = {
  main: {
    description: "Post description",
  },
  music: {
    tracktitle: "Track Title",
  },
  press: {
    artworkLink: "Artwork Link",
  },
};

export const getTitle = (group: TableGroup, key: string) =>
  titlesByGroup[group]?.[key] ?? baseTitles[key] ?? key;

// ---------- dropdown ----------
export const ReqData = ["ASAP", "BEFORE", "AFTER"] as const;

export const getDropdownOptions = (key: DropdownKey): string[] => {
  switch (key) {
    case "date":
      return [...ReqData];
    default:
      return [];
  }
};
export const titles: Record<string, string> = {
  network: "Networks",
  followers: "Followers",
  postlink: "Post link",
  screenshot: "Screenshot",
  impressions: "Impressions",
  likes: "Likes",
  genres: "Genres",
  countries: "Top 5 Countries",
  comments: "Comments",
  saves: "Saves",
  shares: "Shares",
  date: "Req. date",
  content: "Content",
  description: "Post description",
  tag: "Story tag",
  link: "Story link",
  tracklink: "Track link",
  tracktitle: "Track Title",
  brief: "Additional brief",
  action: "Actions",
};
