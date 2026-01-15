import type { FilterItem } from "@/types/client/creator-campaign/filters.types";

export const findPlatformFilter = (
  filters: FilterItem[],
  platform: string
): FilterItem | null => {
  for (const filter of filters) {
    if (filter.id === platform) return filter;

    if (filter.children) {
      const child = filter.children.find((c) => c.id === platform);
      if (child) return child;
    }
  }
  return null;
};
