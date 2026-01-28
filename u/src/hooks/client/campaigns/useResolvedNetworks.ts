import * as React from "react";
import type {
  CampaignContentDescription,
  CampaignContentItem,
} from "@/types/store/index.types";
import type { NetworkRowResolved } from "@/pages/client/campaign/components/tables-campaign/types";

export function useResolvedNetworks(
  networksState: any[],
  items: CampaignContentItem[],
  extraDescriptionsByContentId: Record<string, CampaignContentDescription[]>,
) {
  const contentById = React.useMemo(() => {
    const map = new Map<string, CampaignContentItem>();
    items.forEach((it) => map.set(it._id, it));
    return map;
  }, [items]);

  const descriptionById = React.useMemo(() => {
    const map = new Map<string, CampaignContentDescription>();

    items.forEach((it) => {
      (it as any).descriptions?.forEach((d: CampaignContentDescription) => {
        map.set(d._id, d);
      });
    });

    Object.values(extraDescriptionsByContentId).forEach((arr) => {
      arr.forEach((d) => map.set(d._id, d));
    });

    return map;
  }, [items, extraDescriptionsByContentId]);

  const resolvedNetworks: NetworkRowResolved[] = React.useMemo(() => {
    return networksState.map((n) => {
      const contentId = (n as any).selectedContent?.campaignContentItemId;
      const descId = (n as any).selectedContent?.descriptionId;

      return {
        ...n,
        resolvedContent: contentId ? contentById.get(contentId) : undefined,
        resolvedDescription: descId ? descriptionById.get(descId) : undefined,
      };
    });
  }, [networksState, contentById, descriptionById]);

  return { resolvedNetworks };
}
