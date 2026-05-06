import React from "react";
import type { StrategyRow } from "../../model/campaign-strategy.types";

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
        value: string,
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

    return canEdit ? (
        <input
            className="hidden-text"
            value={item.additionalBrief ?? ""}
            onChange={(e) =>
                setContentField?.(String(item._id), "additionalBrief", e.target.value)
            }
            placeholder="Additional brief"
        />
    ) : (
        <p className="hidden-text">{item.additionalBrief || "—"}</p>
    );
};