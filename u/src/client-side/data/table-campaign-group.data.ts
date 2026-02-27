import type { TableView } from "../utils/getColumns";

export const keys = (view: TableView) => {
  switch (view) {
    case "main":
      return [
        "network",
        "followers",
        "date",
        "content",
        "description",
        "tag",
        "link",
        "brief",
      ];

    case "music":
      return ["network", "followers", "date", "content", "tracktitle", "brief"];

    case "press":
      return [
        "network",
        "followers",
        "date",
        "content",
        "artworkLink",
        "brief",
      ];

    default:
      return [];
  }
};
