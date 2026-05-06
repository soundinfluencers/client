import { useMemo } from "react";
import { useCampaignBuilderStore } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store";
import type { CampaignContentItem } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.types";

export const useEditableContentItem = (
    contentId?: string,
    fallback?: CampaignContentItem | null,
) => {
    const editableItem = useCampaignBuilderStore((state) =>
        contentId
            ? state.campaignContent.find(
            (item) => String(item._id) === String(contentId),
        ) ?? null
            : null,
    );

    return useMemo(
        () => editableItem ?? fallback ?? null,
        [editableItem, fallback],
    );
};