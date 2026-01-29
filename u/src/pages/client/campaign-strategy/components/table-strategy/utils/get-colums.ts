import { keys } from "../table-strategy.data";

export const getColumns = (changeView: boolean, isSocial?: boolean) => {
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
  return keys(isSocial || false);
};
