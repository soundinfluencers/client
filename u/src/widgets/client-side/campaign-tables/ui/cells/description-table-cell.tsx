import React from "react";
import type {
    CampaignContentDescription,
    SelectedCampaignContentRef,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.types";
import type { StrategyRow } from "../../model/campaign-strategy.types";
import { createObjectId } from "../../model/campaign-strategy.helpers";
import {Dropdown} from "@/shared/ui/dropdown-table/dropdowns-table.tsx";


import check from "@/assets/icons/check.svg";
import x from "@/assets/icons/x.svg";
import plus from "@/assets/icons/plus.svg";
import trash from "@/assets/icons/trash-2.svg";

type Variant = "description" | "tracktitle" | "artworkLink";

type Props = {
    row: StrategyRow;
    canSelect: boolean;
    canManage: boolean;
    variant?: Variant;
    setAccountSelectedContent?: (
        accountId: string,
        selected: SelectedCampaignContentRef | null,
    ) => void;
    setContentDescriptions?: (
        contentId: string,
        descriptions: CampaignContentDescription[],
    ) => void;
};

const normalizeLink = (value: string) =>
    value.startsWith("http") ? value : `https://${value}`;

const getPlaceholder = (variant: Variant, index: number) => {
    if (variant === "tracktitle") return `Track title ${index + 1}`;
    if (variant === "artworkLink") return "Artwork link";
    return `Post description ${index + 1}`;
};

const getAddLabel = (variant: Variant) => {
    if (variant === "tracktitle") return "track title";
    if (variant === "artworkLink") return "artwork link";
    return "post description";
};

export const DescriptionTableCell: React.FC<Props> = ({
                                                          row,
                                                          canSelect,
                                                          canManage,
                                                          variant = "description",
                                                          setAccountSelectedContent,
                                                          setContentDescriptions,
                                                      }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [isAdding, setIsAdding] = React.useState(false);
    const [newText, setNewText] = React.useState("");
    const [editIndex, setEditIndex] = React.useState<number | null>(null);
    const [editText, setEditText] = React.useState("");
    const [deleteIndex, setDeleteIndex] = React.useState<number | null>(null);

    const item = row.selectedItem;
    const descriptions = item?.descriptions ?? [];
    const selectedDescription = row.selectedDescription;
    const selectedDescriptionIndex = row.selectedDescriptionIndex ?? 0;
    const selectedText = selectedDescription?.description ?? "";
    const accountId = String(row.account.accountId);
    const contentId = String(item?._id ?? "");

    const commitSelectedDescription = React.useCallback(
        (descriptionId: string) => {
            if (!item?._id || !setAccountSelectedContent) return;

            setAccountSelectedContent(accountId, {
                campaignContentItemId: String(item._id),
                descriptionId: String(descriptionId),
            });
        },
        [accountId, item?._id, setAccountSelectedContent],
    );

    React.useEffect(() => {
        if (!setAccountSelectedContent) return;
        if (!item?._id) return;
        if (!descriptions.length) return;
        if (row.account.selectedCampaignContentItem?.descriptionId) return;

        const firstDescription = descriptions[0];
        if (!firstDescription?._id) return;

        setAccountSelectedContent(accountId, {
            campaignContentItemId: String(item._id),
            descriptionId: String(firstDescription._id),
        });
    }, [
        accountId,
        item?._id,
        descriptions,
        row.account.selectedCampaignContentItem?.descriptionId,
        setAccountSelectedContent,
    ]);

    React.useEffect(() => {
        setIsAdding(false);
        setNewText("");
        setEditIndex(null);
        setEditText("");
        setDeleteIndex(null);
    }, [contentId]);

    const selectDescriptionByIndex = React.useCallback(
        (index: number) => {
            const nextDescription = descriptions[index];
            if (!nextDescription?._id) return;

            commitSelectedDescription(String(nextDescription._id));
            setIsOpen(false);
        },
        [descriptions, commitSelectedDescription],
    );

    const updateDescriptions = React.useCallback(
        (nextDescriptions: CampaignContentDescription[]) => {
            if (!contentId || !setContentDescriptions) return;
            setContentDescriptions(contentId, nextDescriptions);
        },
        [contentId, setContentDescriptions],
    );

    const startAdd = React.useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        setIsAdding(true);
        setNewText("");
        setEditIndex(null);
        setEditText("");
        setDeleteIndex(null);
    }, []);

    const cancelAdd = React.useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        setIsAdding(false);
        setNewText("");
    }, []);

    const commitAdd = React.useCallback(
        (e?: React.MouseEvent) => {
            e?.stopPropagation();

            if (!contentId || !setContentDescriptions) return;

            const trimmed = newText.trim();
            if (!trimmed) {
                setIsAdding(false);
                setNewText("");
                return;
            }

            const created: CampaignContentDescription = {
                _id: createObjectId(),
                description: trimmed,
            };

            const nextDescriptions = [...descriptions, created];
            updateDescriptions(nextDescriptions);

            if (setAccountSelectedContent && item?._id) {
                setAccountSelectedContent(accountId, {
                    campaignContentItemId: String(item._id),
                    descriptionId: String(created._id),
                });
            }

            setIsAdding(false);
            setNewText("");
        },
        [
            contentId,
            newText,
            descriptions,
            updateDescriptions,
            setContentDescriptions,
            setAccountSelectedContent,
            accountId,
            item?._id,
        ],
    );

    const startEdit = React.useCallback(
        (index: number, value: string, e?: React.MouseEvent) => {
            e?.stopPropagation();
            setEditIndex(index);
            setEditText(value);
            setDeleteIndex(null);
            setIsAdding(false);
        },
        [],
    );

    const commitEdit = React.useCallback(
        (index: number) => {
            if (index < 0) return;
            const nextDescriptions = descriptions.map((description, descriptionIndex) =>
                descriptionIndex === index
                    ? { ...description, description: editText }
                    : description,
            );

            updateDescriptions(nextDescriptions);
            setEditIndex(null);
            setEditText("");
        },
        [descriptions, editText, updateDescriptions],
    );

    const cancelEdit = React.useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        setEditIndex(null);
        setEditText("");
    }, []);

    const startDelete = React.useCallback((index: number, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setDeleteIndex(index);
        setEditIndex(null);
        setEditText("");
        setIsAdding(false);
    }, []);

    const cancelDelete = React.useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        setDeleteIndex(null);
    }, []);

    const commitDelete = React.useCallback(
        (index: number, e?: React.MouseEvent) => {
            e?.stopPropagation();

            const nextDescriptions = descriptions.filter(
                (_, descriptionIndex) => descriptionIndex !== index,
            );

            updateDescriptions(nextDescriptions);

            if (!setAccountSelectedContent || !item?._id) {
                setDeleteIndex(null);
                return;
            }

            if (!nextDescriptions.length) {
                setAccountSelectedContent(accountId, {
                    campaignContentItemId: String(item._id),
                    descriptionId: "",
                });
                setDeleteIndex(null);
                return;
            }

            const fallbackIndex = index > 0 ? index - 1 : 0;
            const fallbackDescription = nextDescriptions[fallbackIndex] ?? nextDescriptions[0];

            setAccountSelectedContent(accountId, {
                campaignContentItemId: String(item._id),
                descriptionId: String(fallbackDescription?._id ?? ""),
            });

            setDeleteIndex(null);
        },
        [
            descriptions,
            updateDescriptions,
            setAccountSelectedContent,
            item?._id,
            accountId,
        ],
    );

    if (!item?._id) {
        return <p className="hidden-text">—</p>;
    }

    if (variant === "artworkLink") {
        const artworkValue = selectedText || descriptions[0]?.description || "";

        if (!canManage) {
            return artworkValue ? (
                <a
                    className="hidden-text tagged-link"
                    href={normalizeLink(artworkValue)}
                    target="_blank"
                    rel="noreferrer"
                >
                    {artworkValue}
                </a>
            ) : (
                <p className="hidden-text">—</p>
            );
        }

        return (
            <input
                className="hidden-text desc"
                value={descriptions[0]?.description ?? ""}
                onChange={(e) => {
                    const nextValue = e.target.value;

                    const nextDescriptions = descriptions.length
                        ? descriptions.map((description, index) =>
                            index === 0
                                ? { ...description, description: nextValue }
                                : description,
                        )
                        : [{ _id: createObjectId(), description: nextValue }];

                    updateDescriptions(nextDescriptions);
                }}
                placeholder="Artwork link"
            />
        );
    }

    if (!descriptions.length) {
        if (!canManage) {
            return <p className="hidden-text desc">—</p>;
        }

        return (
            <div>
                {!isAdding ? (
                    <button type="button" onClick={startAdd}>
                        Add
                    </button>
                ) : (
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input
                            autoFocus
                            className="hidden-text desc-li"
                            value={newText}
                            onChange={(e) => setNewText(e.target.value)}
                            placeholder={`New ${getAddLabel(variant)}...`}
                        />
                        <img
                            src={check}
                            alt=""
                            style={{ cursor: "pointer" }}
                            onClick={commitAdd}
                        />
                        <img
                            src={x}
                            alt=""
                            style={{ cursor: "pointer" }}
                            onClick={cancelAdd}
                        />
                    </div>
                )}
            </div>
        );
    }

    if (!canSelect) {
        return (
            <p className="hidden-text desc">
                {selectedText || "—"}
            </p>
        );
    }

    if (!canManage) {
        if (descriptions.length === 1) {
            return (
                <p className="hidden-text desc no-edit">
                    {selectedText || descriptions[0]?.description || "—"}
                </p>
            );
        }

        return (
            <Dropdown
                isOpen={isOpen}
                onOpenChange={setIsOpen}
                selected={
                    <p className="hidden-text desc">
                        {selectedText || "—"}
                    </p>
                }
            >
                <ul className="dropdown-list">
                    {descriptions.map((description, index) => (
                        <li
                            key={description._id}
                            title={description.description}
                            onClick={() => selectDescriptionByIndex(index)}
                        >
                            <span className={selectedDescriptionIndex === index ? "active" : ""}>
                                {index + 1}
                            </span>
                            <p className="hidden-text desc">
                                {description.description || "—"}
                            </p>
                            {selectedDescriptionIndex === index && (
                                <img className="check" src={check} alt="" />
                            )}
                        </li>
                    ))}
                </ul>
            </Dropdown>
        );
    }

    return (
        <Dropdown
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            selected={
                <p className="hidden-text desc">
                    {selectedText || "—"}
                </p>
            }
        >
            <div className="post-description-block">
                <ul className="dropdown-list">
                    {descriptions.map((description, index) => (
                        <li
                            className="desc-li"
                            key={description._id}
                            onClick={() => selectDescriptionByIndex(index)}
                        >
                            <span className={selectedDescriptionIndex === index ? "active" : ""}>
                                {index + 1}
                            </span>

                            {editIndex === index ? (
                                <input
                                    autoFocus
                                    className="hidden-text desc-li"
                                    value={editText}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => setEditText(e.target.value)}
                                    onBlur={() => commitEdit(index)}
                                    placeholder={getPlaceholder(variant, index)}
                                />
                            ) : (
                                <p
                                    className="hidden-text desc-li"
                                    title={description.description}
                                    onClick={(e) =>
                                        startEdit(index, description.description ?? "", e)
                                    }
                                >
                                    {description.description || "—"}
                                </p>
                            )}

                            {editIndex === index ? (
                                <div className="confirm-delete">
                                    <img
                                        src={check}
                                        alt=""
                                        style={{ cursor: "pointer" }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            commitEdit(index);
                                        }}
                                    />
                                    <img
                                        src={x}
                                        alt=""
                                        style={{ cursor: "pointer" }}
                                        onClick={cancelEdit}
                                    />
                                </div>
                            ) : deleteIndex === index ? (
                                <div className="confirm-delete">
                                    <img
                                        src={check}
                                        alt=""
                                        style={{ cursor: "pointer" }}
                                        onClick={(e) => commitDelete(index, e)}
                                    />
                                    <img
                                        src={x}
                                        alt=""
                                        style={{ cursor: "pointer" }}
                                        onClick={cancelDelete}
                                    />
                                </div>
                            ) : (
                                <img
                                    className="trash"
                                    src={trash}
                                    alt=""
                                    onClick={(e) => startDelete(index, e)}
                                />
                            )}
                        </li>
                    ))}

                    {isAdding && (
                        <li
                            key="__new__"
                            onClick={(e) => e.stopPropagation()}
                            style={{ cursor: "default" }}
                        >
                            <span>{descriptions.length + 1}</span>

                            <input
                                autoFocus
                                className="hidden-text desc-li"
                                value={newText}
                                placeholder={`New ${getAddLabel(variant)}...`}
                                onChange={(e) => setNewText(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />

                            <div className="confirm-delete">
                                <img
                                    src={check}
                                    alt=""
                                    style={{ cursor: "pointer" }}
                                    onClick={commitAdd}
                                />
                                <img
                                    src={x}
                                    alt=""
                                    style={{ cursor: "pointer" }}
                                    onClick={cancelAdd}
                                />
                            </div>
                        </li>
                    )}
                </ul>

                {!isAdding && (
                    <div onClick={startAdd} className="add-desc">
                        <div className="add-desc__icon">
                            <img src={plus} alt="" />
                        </div>
                        <p>Add new {getAddLabel(variant)}</p>
                    </div>
                )}
            </div>
        </Dropdown>
    );
};