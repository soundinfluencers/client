import { useUpdateCampaign } from "@/client-side/store";

export function useContentMerged(contentId?: string, baseItem?: any) {
  const patch = useUpdateCampaign((s) =>
    contentId ? s.patches[contentId] : undefined,
  );

  return {
    patch,
    merged: {
      ...baseItem,
      ...(patch ?? {}),
      descriptions: patch?.descriptions ?? baseItem?.descriptions ?? [],
    },
  };
}
