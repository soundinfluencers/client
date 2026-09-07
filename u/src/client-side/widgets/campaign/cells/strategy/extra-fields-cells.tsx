import type { TableGroup } from "@/client-side/types/table-types";
import React from "react";
import { Link } from "react-router-dom";

type Props = {
  group: TableGroup;
  platformItems: any[];
  selectedContent: number;
  changeView?: boolean;
  account?: any;
};

export const ExtraFieldsCells = React.memo(function ExtraFieldsCells({
                                                                       group,
                                                                       platformItems,
                                                                       selectedContent,
                                                                       changeView,
                                                                       account,
                                                                     }: Props) {
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
  }, [group, changeView]);

  const normalizeLink = React.useCallback((value: string) => {
    return value.startsWith("https") ? value : `https://${value}`;
  }, []);

  return (
      <>
        {keys.map((key) => {
          const raw = platformItems?.[selectedContent]?.[key];
          const selectedBriefId =
              account?.selectedContent?.additionalBriefId ??
              account?.selectedCampaignContentItem?.additionalBriefId;
          const selectedBrief = Array.isArray(raw)
              ? raw.find(
                  (brief: any) =>
                      String(brief?._id ?? "") === String(selectedBriefId ?? ""),
              ) ?? raw[0]
              : null;
          const resolved =
              key === "additionalBrief"
                  ? account?.selectedContentItem?.additionalBrief ??
                    (typeof account?.selectedCampaignContentItem
                        ?.additionalBrief === "string"
                        ? account.selectedCampaignContentItem.additionalBrief
                        : undefined) ??
                    selectedBrief?.additionalBrief ??
                    (typeof raw === "string" ? raw : "")
                  : raw;
          const value = String(resolved ?? "").trim();
          const shown = value || "—";

          return (
              <td key={key} className="tableBase__td">
                {key === "taggedLink" || key === 'mainLink' && value ? (
                    <Link
                        className={`hidden-text ${value ? "tagged-link" : ''}`}
                        to={normalizeLink(value)}
                        target="_blank"
                        rel="noreferrer">
                      {shown}
                    </Link>
                ) : (
                    <p className="hidden-text">{shown}</p>
                )}
              </td>
          );
        })}
      </>
  );
});
