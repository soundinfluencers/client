import type { DropdownKey } from "../table-strategy";

export const columns = [
  "network",
  "followers",
  "date",
  "content",
  "description",
  "tracklink",
  "tracktitle",
  "brief",
];

export const titles: Record<string, string> = {
  network: "Networks",
  followers: "Followers",
  genres: "Genres",
  countries: "Top 5 countries",
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
