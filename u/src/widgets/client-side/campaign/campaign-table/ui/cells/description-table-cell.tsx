import React from "react";

import type {
    EditableDescription,
    SelectedCampaignContentItem,
} from "@/entities/client-side/campaign/store/campaign.store";
import type { CampaignTableRow } from "../../model/campaign-table.types";

import { Dropdown } from "@/shared/ui/dropdown-table/dropdowns-table.tsx";

import check from "@/assets/icons/check.svg";
import x from "@/assets/icons/x.svg";
import plus from "@/assets/icons/plus.svg";
import trash from "@/assets/icons/trash-2.svg";

import styles from "./cells.module.scss";

type Variant = "description" | "tracktitle" | "artworkLink";

type Props = {
    row: CampaignTableRow;
    canSelect: boolean;
    canManage: boolean;
    variant?: Variant;
    setAccountSelectedContent?: (
        accountKey: string,
        selected: SelectedCampaignContentItem | null,
    ) => void;
    setContentDescriptions?: (
        contentId: string,
        descriptions: EditableDescription[],
    ) => void;
};

const CLICK_DELAY = 240;

const createObjectId = () => {
    const bytes = new Uint8Array(12);

    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
        crypto.getRandomValues(bytes);
    } else {
        for (let i = 0; i < 12; i++) {
            bytes[i] = Math.floor(Math.random() * 256);
        }
    }

    return Array.from(bytes)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
};

const normalizeLink = (value: string) => {
    const prepared = String(value ?? "").trim();

    if (!prepared) return "";

    return prepared.startsWith("http") ? prepared : `https://${prepared}`;
};

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
    const clickTimerRef = React.useRef<number | null>(null);

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

    const accountKey = row.accountKey;
    const contentId = String(item?._id ?? "");

    React.useEffect(() => {
        return () => {
            if (clickTimerRef.current) {
                window.clearTimeout(clickTimerRef.current);
                clickTimerRef.current = null;
            }
        };
    }, []);

    React.useEffect(() => {
        if (clickTimerRef.current) {
            window.clearTimeout(clickTimerRef.current);
            clickTimerRef.current = null;
        }

        setIsAdding(false);
        setNewText("");
        setEditIndex(null);
        setEditText("");
        setDeleteIndex(null);
    }, [contentId]);

    const clearClickTimer = React.useCallback(() => {
        if (!clickTimerRef.current) return;

        window.clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
    }, []);

    const commitSelectedDescription = React.useCallback(
        (descriptionId: string) => {
            if (!item?._id || !setAccountSelectedContent) return;

            setAccountSelectedContent(accountKey, {
                campaignContentItemId: String(item._id),
                descriptionId: String(descriptionId),
            });
        },
        [accountKey, item?._id, setAccountSelectedContent],
    );

    React.useEffect(() => {
        if (!setAccountSelectedContent) return;
        if (!item?._id) return;
        if (!descriptions.length) return;
        if (row.account.selectedCampaignContentItem?.descriptionId) return;

        const firstDescription = descriptions[0];

        if (!firstDescription?._id) return;

        setAccountSelectedContent(accountKey, {
            campaignContentItemId: String(item._id),
            descriptionId: String(firstDescription._id),
        });
    }, [
        accountKey,
        item?._id,
        descriptions,
        row.account.selectedCampaignContentItem?.descriptionId,
        setAccountSelectedContent,
    ]);

    const updateDescriptions = React.useCallback(
        (nextDescriptions: EditableDescription[]) => {
            if (!contentId || !setContentDescriptions) return;

            setContentDescriptions(contentId, nextDescriptions);
        },
        [contentId, setContentDescriptions],
    );

    const selectDescriptionByIndex = React.useCallback(
        (index: number, close = true) => {
            if (editIndex !== null || deleteIndex !== null || isAdding) return;

            const nextDescription = descriptions[index];

            if (!nextDescription?._id) return;

            commitSelectedDescription(String(nextDescription._id));

            if (close) {
                setIsOpen(false);
            }
        },
        [
            descriptions,
            commitSelectedDescription,
            editIndex,
            deleteIndex,
            isAdding,
        ],
    );

    const handleItemClick = React.useCallback(
        (index: number) => {
            if (editIndex !== null || deleteIndex !== null || isAdding) return;

            clearClickTimer();

            clickTimerRef.current = window.setTimeout(() => {
                selectDescriptionByIndex(index, true);
                clickTimerRef.current = null;
            }, CLICK_DELAY);
        },
        [
            clearClickTimer,
            selectDescriptionByIndex,
            editIndex,
            deleteIndex,
            isAdding,
        ],
    );

    const startEdit = React.useCallback(
        (index: number, value: string, e?: React.MouseEvent) => {
            e?.preventDefault();
            e?.stopPropagation();

            clearClickTimer();

            setDeleteIndex(null);
            setIsAdding(false);
            setEditIndex(index);
            setEditText(value ?? "");
        },
        [clearClickTimer],
    );

    const handleItemDoubleClick = React.useCallback(
        (index: number, value: string, e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            clearClickTimer();
            startEdit(index, value, e);
        },
        [clearClickTimer, startEdit],
    );

    const cancelEdit = React.useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        setEditIndex(null);
        setEditText("");
    }, []);

    const commitEdit = React.useCallback(
        (index: number) => {
            if (index < 0) return;

            const trimmed = editText.trim();

            if (!trimmed) {
                setEditIndex(null);
                setEditText("");
                return;
            }

            const nextDescriptions = descriptions.map(
                (description, descriptionIndex) =>
                    descriptionIndex === index
                        ? {
                            ...description,
                            description: trimmed,
                        }
                        : description,
            );

            updateDescriptions(nextDescriptions);
            setEditIndex(null);
            setEditText("");
        },
        [descriptions, editText, updateDescriptions],
    );

    const startAdd = React.useCallback(
        (e?: React.MouseEvent) => {
            e?.stopPropagation();

            clearClickTimer();

            setIsAdding(true);
            setNewText("");
            setEditIndex(null);
            setEditText("");
            setDeleteIndex(null);
        },
        [clearClickTimer],
    );

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

            const created: EditableDescription = {
                _id: createObjectId(),
                description: trimmed,
            };

            const nextDescriptions = [...descriptions, created];

            updateDescriptions(nextDescriptions);

            if (setAccountSelectedContent && item?._id) {
                setAccountSelectedContent(accountKey, {
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
            accountKey,
            item?._id,
        ],
    );

    const startDelete = React.useCallback(
        (index: number, e?: React.MouseEvent) => {
            e?.stopPropagation();

            clearClickTimer();

            setDeleteIndex(index);
            setEditIndex(null);
            setEditText("");
            setIsAdding(false);
        },
        [clearClickTimer],
    );

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
                setAccountSelectedContent(accountKey, {
                    campaignContentItemId: String(item._id),
                    descriptionId: "",
                });

                setDeleteIndex(null);
                return;
            }

            const fallbackIndex = index > 0 ? index - 1 : 0;
            const fallbackDescription =
                nextDescriptions[fallbackIndex] ?? nextDescriptions[0];

            setAccountSelectedContent(accountKey, {
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
            accountKey,
        ],
    );

    if (!item?._id) {
        return <p className={styles.empty}>—</p>;
    }

    if (variant === "artworkLink") {
        const artworkValue = selectedText || descriptions[0]?.description || "";

        if (!canManage) {
            return artworkValue ? (
                <a
                    className={styles.link}
                    href={normalizeLink(artworkValue)}
                    target="_blank"
                    rel="noreferrer"
                >
                    {artworkValue}
                </a>
            ) : (
                <p className={styles.empty}>—</p>
            );
        }

        return (
            <input
                className={styles.input}
                value={descriptions[0]?.description ?? ""}
                onChange={(e) => {
                    const nextValue = e.target.value;

                    const nextDescriptions = descriptions.length
                        ? descriptions.map((description, index) =>
                            index === 0
                                ? {
                                    ...description,
                                    description: nextValue,
                                }
                                : description,
                        )
                        : [
                            {
                                _id: createObjectId(),
                                description: nextValue,
                            },
                        ];

                    updateDescriptions(nextDescriptions);
                }}
                placeholder="Artwork link"
            />
        );
    }

    if (!descriptions.length) {
        if (!canManage) {
            return <p className={styles.empty}>—</p>;
        }

        return (
            <div className={styles.emptyEditor}>
                {!isAdding ? (
                    <button
                        type="button"
                        onClick={startAdd}
                        className={styles.addButton}
                    >
                        <span className={styles.addIcon}>
                            <img src={plus} alt="" />
                        </span>

                        <span>Add {getAddLabel(variant)}</span>
                    </button>
                ) : (
                    <div className={styles.inlineEditor}>
                        <input
                            autoFocus
                            className={styles.inlineInput}
                            value={newText}
                            onChange={(e) => setNewText(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            onDoubleClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                                e.stopPropagation();

                                if (e.key === "Enter") {
                                    commitAdd();
                                }

                                if (e.key === "Escape") {
                                    cancelAdd();
                                }
                            }}
                            placeholder={`New ${getAddLabel(variant)}...`}
                        />

                        <button
                            type="button"
                            className={styles.iconAction}
                            onClick={commitAdd}
                        >
                            <img src={check} alt="" />
                        </button>

                        <button
                            type="button"
                            className={styles.iconAction}
                            onClick={cancelAdd}
                        >
                            <img src={x} alt="" />
                        </button>
                    </div>
                )}
            </div>
        );
    }

    if (!canSelect) {
        return (
            <p className={`${styles.baseLine} ${styles.truncate}`}>
                {selectedText || "—"}
            </p>
        );
    }

    if (!canManage) {
        if (descriptions.length === 1) {
            return (
                <p className={`${styles.baseLine} ${styles.truncate}`}>
                    {selectedText || descriptions[0]?.description || "—"}
                </p>
            );
        }

        return (
            <Dropdown
                isOpen={isOpen}
                onOpenChange={setIsOpen}
                selected={
                    <p className={`${styles.contentCell} ${styles.truncate}`}>
                        {selectedText || "—"}
                    </p>
                }
            >
                <ul className={styles.descriptionList}>
                    {descriptions.map((description, index) => (
                        <li
                            key={description._id}
                            title={description.description}
                            className={styles.descriptionItem}
                            onClick={() => selectDescriptionByIndex(index)}
                        >
                            <span
                                className={`${styles.indexBadge} ${
                                    selectedDescriptionIndex === index
                                        ? styles.active
                                        : ""
                                }`}
                            >
                                {index + 1}
                            </span>

                            <p className={styles.truncate}>
                                {description.description || "—"}
                            </p>

                            {selectedDescriptionIndex === index && (
                                <img
                                    className={styles.checkIcon}
                                    src={check}
                                    alt=""
                                />
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
                <p className={`${styles.contentCell} ${styles.truncate}`}>
                    {selectedText || "—"}
                </p>
            }
        >
            <div
                className={styles.contentDropdown}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
            >
                <ul className={styles.descriptionList}>
                    {descriptions.map((description, index) => (
                        <li
                            className={styles.descriptionItem}
                            key={description._id}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={() => handleItemClick(index)}
                            onDoubleClick={(e) =>
                                handleItemDoubleClick(
                                    index,
                                    description.description ?? "",
                                    e,
                                )
                            }
                        >
                            <span
                                className={`${styles.indexBadge} ${
                                    selectedDescriptionIndex === index
                                        ? styles.active
                                        : ""
                                }`}
                            >
                                {index + 1}
                            </span>

                            {editIndex === index ? (
                                <input
                                    autoFocus
                                    className={styles.inlineInput}
                                    value={editText}
                                    onClick={(e) => e.stopPropagation()}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onDoubleClick={(e) => e.stopPropagation()}
                                    onChange={(e) => setEditText(e.target.value)}
                                    onBlur={() => commitEdit(index)}
                                    onKeyDown={(e) => {
                                        e.stopPropagation();

                                        if (e.key === "Enter") {
                                            commitEdit(index);
                                        }

                                        if (e.key === "Escape") {
                                            cancelEdit();
                                        }
                                    }}
                                    placeholder={getPlaceholder(variant, index)}
                                />
                            ) : (
                                <p
                                    className={styles.truncate}
                                    title={description.description}
                                >
                                    {description.description || "—"}
                                </p>
                            )}

                            {editIndex === index ? (
                                <div
                                    className={styles.actionsInline}
                                    onClick={(e) => e.stopPropagation()}
                                    onMouseDown={(e) => e.stopPropagation()}
                                >
                                    <button
                                        type="button"
                                        className={styles.iconAction}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            commitEdit(index);
                                        }}
                                    >
                                        <img src={check} alt="" />
                                    </button>

                                    <button
                                        type="button"
                                        className={styles.iconAction}
                                        onClick={cancelEdit}
                                    >
                                        <img src={x} alt="" />
                                    </button>
                                </div>
                            ) : deleteIndex === index ? (
                                <div
                                    className={styles.actionsInline}
                                    onClick={(e) => e.stopPropagation()}
                                    onMouseDown={(e) => e.stopPropagation()}
                                >
                                    <button
                                        type="button"
                                        className={styles.iconAction}
                                        onClick={(e) => commitDelete(index, e)}
                                    >
                                        <img src={check} alt="" />
                                    </button>

                                    <button
                                        type="button"
                                        className={styles.iconAction}
                                        onClick={cancelDelete}
                                    >
                                        <img src={x} alt="" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    className={styles.trash}
                                    onClick={(e) => startDelete(index, e)}
                                >
                                    <img src={trash} alt="" />
                                </button>
                            )}
                        </li>
                    ))}

                    {isAdding && (
                        <li
                            key="__new__"
                            className={styles.descriptionItem}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <span className={styles.indexBadge}>
                                {descriptions.length + 1}
                            </span>

                            <input
                                autoFocus
                                className={styles.inlineInput}
                                value={newText}
                                placeholder={`New ${getAddLabel(variant)}...`}
                                onChange={(e) => setNewText(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                                onDoubleClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => {
                                    e.stopPropagation();

                                    if (e.key === "Enter") {
                                        commitAdd();
                                    }

                                    if (e.key === "Escape") {
                                        cancelAdd();
                                    }
                                }}
                            />

                            <div
                                className={styles.actionsInline}
                                onClick={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                            >
                                <button
                                    type="button"
                                    className={styles.iconAction}
                                    onClick={commitAdd}
                                >
                                    <img src={check} alt="" />
                                </button>

                                <button
                                    type="button"
                                    className={styles.iconAction}
                                    onClick={cancelAdd}
                                >
                                    <img src={x} alt="" />
                                </button>
                            </div>
                        </li>
                    )}
                </ul>

                {!isAdding && (
                    <button
                        type="button"
                        onClick={startAdd}
                        className={styles.addButton}
                    >
                        <span className={styles.addIcon}>
                            <img src={plus} alt="" />
                        </span>

                        <span>Add new {getAddLabel(variant)}</span>
                    </button>
                )}
            </div>
        </Dropdown>
    );
};