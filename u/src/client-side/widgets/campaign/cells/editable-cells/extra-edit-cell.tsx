import { useUpdateCampaign } from "@/client-side/store";
import type { TableGroup } from "@/client-side/types/table-types";

import React from "react";
import { ObjectId } from "bson";

type Props = {
  group: TableGroup;
  contentId?: string;
  baseItem?: any;
  changeView?: boolean
  account?: any;
};

export const ExtraFieldsCellsEdit = React.memo(function ExtraFieldsCellsEdit({
  group,
  contentId,
  baseItem,changeView,account
}: Props) {
  const patch = useUpdateCampaign((s) =>
    contentId ? s.patches[contentId] : undefined,
  );
  const setField = useUpdateCampaign((s) => s.setField);

  const keys = React.useMemo(() => {
    if (changeView) {
      return group === "press" ? (["additionalBrief"] as const) : ([] as const);
    }
    switch (group) {
      case "music":
        return ["additionalBrief"] as const;
      case "main":
        return ["taggedUser", "taggedLink", "additionalBrief"] as const;
      case "press":
        return ['mainLink','taggedLink',"additionalBrief"] as const;
      default:
        return [] as const;
    }
  }, [group]);

  const getBriefs = React.useCallback(() => {
    const value = patch?.additionalBrief ?? baseItem?.additionalBrief;
    return Array.isArray(value) ? value : [];
  }, [patch?.additionalBrief, baseItem?.additionalBrief]);
  const selectedBriefId = String(
    account?.selectedContent?.additionalBriefId ??
    account?.selectedCampaignContentItem?.additionalBriefId ??
    "",
  );
  const getValue = React.useCallback(
    (key: (typeof keys)[number]) => {
      const value = patch?.[key] ?? baseItem?.[key] ?? "";
      if (key !== "additionalBrief") return String(value ?? "");
      if (typeof value === "string") return value;

      const briefs = Array.isArray(value) ? value : [];
      return String(
        briefs.find((brief: any) => String(brief?._id) === selectedBriefId)
          ?.additionalBrief ?? briefs[0]?.additionalBrief ?? "",
      );
    },
    [patch, baseItem, selectedBriefId],
  );
  const updateValue = React.useCallback(
    (key: (typeof keys)[number], value: string) => {
      if (key !== "additionalBrief") {
        setField(contentId!, key, value);
        return;
      }

      const briefs = getBriefs();
      if (!briefs.length) {
        setField(contentId!, key, [
          { _id: new ObjectId().toHexString(), additionalBrief: value },
        ]);
        return;
      }

      const targetId = briefs.some(
        (brief: any) => String(brief?._id) === selectedBriefId,
      )
        ? selectedBriefId
        : String(briefs[0]?._id ?? "");
      setField(
        contentId!,
        key,
        briefs.map((brief: any) =>
          String(brief?._id ?? "") === targetId
            ? { ...brief, additionalBrief: value }
            : brief,
        ),
      );
    },
    [contentId, getBriefs, selectedBriefId, setField],
  );

  React.useEffect(() => {
    if (!contentId) return;

    console.log("PATCH for", contentId, patch);
  }, [contentId, patch]);

  if (!contentId) {
    return (
      <>
        {keys.map((k) => (
          <td key={k} className="tableBase__td">
            —
          </td>
        ))}
      </>
    );
  }

  const placeholders: Record<string, string> = {
    taggedUser: "Tagged user",
    taggedLink: "Tagged link",
    additionalBrief: "Additional brief",
  };
  return (
    <>
      {keys.map((key) => (
        <td key={key} className="tableBase__td">
          <input
            value={getValue(key)}
            onChange={(e) => updateValue(key, e.target.value)}
            placeholder={placeholders[key] ?? key}
          />
        </td>
      ))}
    </>
  );
});
