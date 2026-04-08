export type TableView = "main" | "music" | "press";

type TableMode = "default" | "changeView";

const TABLE_COLUMNS: Record<TableMode, Record<TableView, string[]>> = {
  default: {
    main: [
      "network",
      "followers",
      "date",
      "content",
      "description",
      "tag",
      "link",
      "brief",
    ],
    music: [
      "network",
      "followers",
      "date",
      "content",
      "tracktitle",
      "brief",
    ],
    press: [
      "network",
      "date",
      "content",
      "artworkLink",
      "pressLink",
      "brief",
    ],
  },

  changeView: {
    main: [
      "network",
      "followers",
      "content",
      "description",
      "genres",
      "countries",
    ],
    music: [
      "network",
      "followers",
      "content",
      "tracktitle",
      "genres",
    ],
    press: [
      "network",
      "brief",
      "genres",
    ],
  },
};

export const getColumns = (
    changeView: boolean,
    tableView: TableView = "main",
    canEdit = false,
) => {
  const mode: TableMode = changeView ? "changeView" : "default";

  const base = [...TABLE_COLUMNS[mode][tableView]];

  if (!changeView && canEdit && !base.includes("action")) {
    base.push("action");
  }

  if (!canEdit) {
    return base.filter((col) => col !== "action");
  }

  return base;
};