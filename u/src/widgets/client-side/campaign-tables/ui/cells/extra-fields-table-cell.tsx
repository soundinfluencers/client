import React from "react";
import type { StrategyRow } from "../../model/campaign-strategy.types";
import { createObjectId } from "../../model/campaign-strategy.helpers";
import type { CampaignContentItem } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.types";

type ExtraFieldType =
    | "tag"
    | "link"
    | "brief"
    | "pressLink";

type Props = {
    row: StrategyRow;
    canEdit: boolean;
    field: ExtraFieldType;
    setContentField?: (
        contentId: string,
        field: "mainLink" | "taggedUser" | "taggedLink" | "additionalBrief",
        value: string | CampaignContentItem["additionalBrief"],
    ) => void;
};

const normalizeLink = (value: string) =>
    value.startsWith("http") ? value : `https://${value}`;

export const ExtraFieldsTableCell: React.FC<Props> = ({
                                                          row,
                                                          canEdit,
                                                          field,
                                                          setContentField,
                                                      }) => {
    const item = row.selectedItem;

    if (!item?._id) {
        return <p className="hidden-text">—</p>;
    }

    if (field === "tag") {
        return canEdit ? (
            <input
                className="hidden-text"
                value={item.taggedUser ?? ""}
                onChange={(e) =>
                    setContentField?.(String(item._id), "taggedUser", e.target.value)
                }
                placeholder="Tagged user"
            />
        ) : (
            <p className="hidden-text">{item.taggedUser || "—"}</p>
        );
    }

    if (field === "link" || field === "pressLink") {
        return canEdit ? (
            <input
                className="hidden-text"
                value={item.taggedLink ?? ""}
                onChange={(e) =>
                    setContentField?.(String(item._id), "taggedLink", e.target.value)
                }
                placeholder={field === "pressLink" ? "Press link" : "Tagged link"}
            />
        ) : item.taggedLink ? (
            <a
                className="hidden-text tagged-link"
                href={normalizeLink(item.taggedLink)}
                target="_blank"
                rel="noreferrer"
            >
                {item.taggedLink}
            </a>
        ) : (
            <p className="hidden-text">—</p>
        );
    }

    const account = row.account as any;
    const additionalBriefOptions = Array.isArray(item.additionalBrief)
        ? item.additionalBrief
        : [];
    const selectedAdditionalBrief =
        additionalBriefOptions.find(
            (brief: any) =>
                String(brief?._id ?? "") ===
                String(
                    account?.selectedCampaignContentItem?.additionalBriefId ?? "",
                ),
        )?.additionalBrief ??
        account?.selectedContentItem?.additionalBrief ??
        (typeof item.additionalBrief === "string"
            ? item.additionalBrief
            : additionalBriefOptions[0]?.additionalBrief ?? "");

    return canEdit ? (
        <input
            className="hidden-text"
            value={selectedAdditionalBrief}
            onChange={(e) => {
                const selectedId = String(
                    account?.selectedCampaignContentItem?.additionalBriefId ??
                    additionalBriefOptions[0]?._id ??
                    "",
                );
                const next = additionalBriefOptions.length
                    ? additionalBriefOptions.map((brief) =>
                        String(brief._id) === selectedId
                            ? { ...brief, additionalBrief: e.target.value }
                            : brief,
                    )
                    : [{
                        _id: createObjectId(),
                        additionalBrief: e.target.value,
                    }];
                setContentField?.(String(item._id), "additionalBrief", next);
            }}
            placeholder="Additional brief"
        />
    ) : (
        <p className="hidden-text">{selectedAdditionalBrief || "—"}</p>
    );
};
