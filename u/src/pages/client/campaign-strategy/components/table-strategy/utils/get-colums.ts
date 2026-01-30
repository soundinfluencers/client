import type { TableView } from "../table-strategy";
import { keys } from "../table-strategy.data";

export const getColumns = (changeView: boolean, TableView?: TableView) => {
  if (changeView) {
    return [
      "network",
      "followers",
      "genres",
      "countries",
      "content",
      "description",
    ];
  }
  return keys(TableView || "main");
};
