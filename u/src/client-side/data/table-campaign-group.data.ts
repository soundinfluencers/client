import type { TableView } from "@/pages/client/types";

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
      return [
        "network",
        "followers",
        "date",
        "content",
        "description",
        "brief",
      ];

    case "press":
      return [
        "network",
        "followers",
        "date",
        "content",
        "description",
        "brief",
      ];

    default:
      return [];
  }
};
