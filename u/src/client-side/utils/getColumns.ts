import { keys } from "../data/table-campaign-group.data";
export type TableView = "main" | "music" | "press";
export const getColumns = (
  changeView: boolean,
  tableView: TableView = "main",
  canEdit = false,
) => {
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

  const base = [...keys(tableView)];

  if (canEdit && !base.includes("action")) base.push("action");
  if (!canEdit && base.includes("action"))
    return base.filter((c) => c !== "action");

  return base;
};
