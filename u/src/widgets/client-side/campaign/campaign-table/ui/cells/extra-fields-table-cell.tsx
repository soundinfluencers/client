import React from "react";

import type { CampaignTableRow } from "../../model/campaign-table.types";

type ExtraFieldType =
    | "tag"
    | "link"
    | "brief"
    | "pressReleaseLink"
    | "pressBrief";

type Props = {
    row: CampaignTableRow;
    canEdit: boolean;
    field: ExtraFieldType;
    setContentField?: (
        contentId: string,
        field: "mainLink" | "taggedUser" | "taggedLink" | "additionalBrief",
        value: string,
    ) => void;
};

const normalizeLink = (value: string) => {
    const prepared = String(value ?? "").trim();

    if (!prepared) return "";

    return prepared.startsWith("http") ? prepared : `https://${prepared}`;
};

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
                    setContentField?.(
                        String(item._id),
                        "taggedUser",
                        e.target.value,
                    )
                }
                placeholder="Tagged user"
            />
        ) : (
            <p className="hidden-text">{item.taggedUser || "—"}</p>
        );
    }

    if (field === "link" || field === "pressReleaseLink") {
        return canEdit ? (
            <input
                className="hidden-text"
                value={item.taggedLink ?? ""}
                onChange={(e) =>
                    setContentField?.(
                        String(item._id),
                        "taggedLink",
                        e.target.value,
                    )
                }
                placeholder={
                    field === "pressReleaseLink"
                        ? "Link to press release"
                        : "Tagged link"
                }
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

    if (field === "brief" || field === "pressBrief") {
        return canEdit ? (
            <input
                className="hidden-text"
                value={item.additionalBrief ?? ""}
                onChange={(e) =>
                    setContentField?.(
                        String(item._id),
                        "additionalBrief",
                        e.target.value,
                    )
                }
                placeholder="Additional brief"
            />
        ) : (
            <p className="hidden-text">{item.additionalBrief || "—"}</p>
        );
    }

    return <p className="hidden-text">—</p>;
};