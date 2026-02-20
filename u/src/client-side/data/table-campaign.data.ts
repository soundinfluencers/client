import type { DropdownKey } from "../types/table-types";

export const proposalsData = [
  {
    network: "Dance music BPM",
    followers: "12M",
    genres: ["Techno (All)", "Bass", "EDM", "Psy", "Techno (All)"],
    countries: ["DE 16.5%", "UK 8%", "FR 16.5%", "ES 8%", "IT 16.5%"],
  },
  {
    network: "Techno TV",
    followers: "112M",
    genres: ["Techno (All)", "Bass", "EDM", "Psy", "Techno (All)"],
    countries: ["DE 16.5%", "UK 8%", "FR 16.5%", "ES 8%", "IT 16.5%"],
  },
];
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
];
export const columnsStrategy = [
  "network",
  "followers",
  "date",
  "content",
  "description",
  "tag",
  "link",
  "brief",
];
export const columnsProposals = [
  "network",
  "followers",
  "genres",
  "countries",
  "content",
  "description",
  "action",
];
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
          taggedUser: 160,
          taggedLink: 220,
          additionalBrief: 260,
          tracklink: 200,
          tracktitle: 200,
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

export const ReqData = ["ASAP", "BEFORE", "AFTER"];

export const getDropdownOptions = (key: DropdownKey): string[] => {
  switch (key) {
    case "date":
      return ReqData;
    default:
      return [];
  }
};
