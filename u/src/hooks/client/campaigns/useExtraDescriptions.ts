import type { CampaignContentDescription } from "@/types/store/index.types";
import * as React from "react";

export function useExtraDescriptions() {
  const [extraDescriptionsByContentId, setExtraDescriptionsByContentId] =
    React.useState<Record<string, CampaignContentDescription[]>>({});

  const addDescriptionForContent = React.useCallback(
    (contentId: string, text: string) => {
      const newDesc: CampaignContentDescription = {
        _id: `tmp-${contentId}-${Date.now()}`,
        description: text,
      };

      setExtraDescriptionsByContentId((prev) => ({
        ...prev,
        [contentId]: [...(prev[contentId] ?? []), newDesc],
      }));

      return newDesc._id;
    },
    [],
  );

  return { extraDescriptionsByContentId, addDescriptionForContent };
}
