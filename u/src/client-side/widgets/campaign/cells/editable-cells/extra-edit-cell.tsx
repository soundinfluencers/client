import { useUpdateCampaign } from "@/client-side/store";
import type { TableGroup } from "@/client-side/types/table-types";

import React from "react";

type Props = {
  group: TableGroup;
  contentId?: string;
  baseItem?: any;
  changeView?: boolean
};

export const ExtraFieldsCellsEdit = React.memo(function ExtraFieldsCellsEdit({
  group,
  contentId,
  baseItem,changeView
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

  const getValue = React.useCallback(
    (key: (typeof keys)[number]) =>
      (patch?.[key] ?? baseItem?.[key] ?? "") as string,
    [patch, baseItem],
  );

  const placeholders: Record<string, string> = {
    taggedUser: "Tagged user",
    taggedLink: "Tagged link",
    additionalBrief: "Additional brief",
  };
  React.useEffect(() => {
    console.log("PATCH for", contentId, patch);
  }, [contentId, patch]);
  return (
    <>
      {keys.map((key) => (
        <td key={key} className="tableBase__td">
          <input
            value={getValue(key)}
            onChange={(e) => setField(contentId, key, e.target.value)}
            placeholder={placeholders[key] ?? key}
          />
        </td>
      ))}
    </>
  );
});
