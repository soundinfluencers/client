import React from "react";
import { Dropdown } from "@/components/table-ui/dropdowns-table";

import check from "@/assets/icons/check (2).svg";
import x from "@/assets/icons/x (2).svg";
import plus from "@/assets/icons/plus.svg";
import trash from "@/assets/icons/trash-2.svg";
import { useUpdateCampaign } from "@/client-side/store";

type Desc = { _id?: string; description: string };

type Props = {
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
    platformItems: any[];
    selectedContent: number;
    onSelectDescriptionId?: (descriptionId: string) => void;
    selectedPd: number;
    setSelectedPd: (v: number) => void;
    group: string;
};

const makeObjectId = () => {
    if (crypto.randomUUID) {
        return crypto.randomUUID().replace(/-/g, "").slice(0, 24);
    }

    return Math.random().toString(16).slice(2).padEnd(24, "0").slice(0, 24);
};

export const DescriptionCellEdit = React.memo(function DescriptionCellEdit({
                                                                               isOpen,
                                                                               onToggle,
                                                                               onClose,
                                                                               platformItems,
                                                                               selectedContent,
                                                                               selectedPd,
                                                                               setSelectedPd,
                                                                               group,
                                                                               onSelectDescriptionId,
                                                                           }: Props) {
    const baseItem = platformItems?.[selectedContent];
    const contentId: string | undefined = baseItem?._id;

    const clickTimerRef = React.useRef<number | null>(null);

    const patch = useUpdateCampaign((s) =>
        contentId ? s.patches[contentId] : undefined,
    );

    const updateDescription = useUpdateCampaign((s) => s.updateDescription);
    const setDescriptions = useUpdateCampaign((s) => s.setDescriptions);

    const serverDescs: Desc[] = baseItem?.descriptions ?? [];
    const editingDescs: Desc[] = (patch?.descriptions ?? serverDescs) as Desc[];

    const safeSelectedText =
        String(editingDescs?.[selectedPd]?.description ?? "").trim() || "—";

    const [editIdx, setEditIdx] = React.useState<number | null>(null);
    const [editText, setEditText] = React.useState("");
    const [deleteIdx, setDeleteIdx] = React.useState<number | null>(null);

    const [isAdding, setIsAdding] = React.useState(false);
    const [newText, setNewText] = React.useState("");

    React.useEffect(() => {
        return () => {
            if (clickTimerRef.current) {
                window.clearTimeout(clickTimerRef.current);
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
        setDeleteIdx(null);
        setEditIdx(null);
        setEditText("");
    }, [contentId]);

    const ensurePatchDescs = React.useCallback(() => {
        if (!contentId) return;
        if (patch?.descriptions) return;

        setDescriptions(
            contentId,
            (serverDescs ?? []).map((desc: any) => ({
                _id: String(desc._id ?? ""),
                description: String(desc.description ?? ""),
            })),
        );
    }, [contentId, patch?.descriptions, serverDescs, setDescriptions]);

    const groupTitle = React.useCallback((value: string) => {
        switch (value) {
            case "main":
                return "post description";
            case "music":
                return "track title";
            case "press":
                return "artwork link";
            default:
                return "description";
        }
    }, []);

    const selectPd = React.useCallback(
        (idx: number, close = true) => {
            if (editIdx !== null || deleteIdx !== null || isAdding) return;

            const nextId = String(editingDescs?.[idx]?._id ?? "");

            setSelectedPd(idx);
            onSelectDescriptionId?.(nextId);

            if (close) {
                onClose();
            }
        },
        [
            editIdx,
            deleteIdx,
            isAdding,
            editingDescs,
            setSelectedPd,
            onSelectDescriptionId,
            onClose,
        ],
    );

    const handleItemClick = React.useCallback(
        (idx: number) => {
            if (editIdx !== null || deleteIdx !== null || isAdding) return;

            if (clickTimerRef.current) {
                window.clearTimeout(clickTimerRef.current);
            }

            clickTimerRef.current = window.setTimeout(() => {
                selectPd(idx, true);
                clickTimerRef.current = null;
            }, 250);
        },
        [selectPd, editIdx, deleteIdx, isAdding],
    );

    const startEdit = React.useCallback(
        (e: React.MouseEvent, idx: number, text: string) => {
            e.preventDefault();
            e.stopPropagation();

            if (clickTimerRef.current) {
                window.clearTimeout(clickTimerRef.current);
                clickTimerRef.current = null;
            }

            ensurePatchDescs();

            setDeleteIdx(null);
            setIsAdding(false);
            setEditIdx(idx);
            setEditText(text ?? "");
        },
        [ensurePatchDescs],
    );

    const handleItemDoubleClick = React.useCallback(
        (e: React.MouseEvent, idx: number, text: string) => {
            e.preventDefault();
            e.stopPropagation();

            if (clickTimerRef.current) {
                window.clearTimeout(clickTimerRef.current);
                clickTimerRef.current = null;
            }

            startEdit(e, idx, text);
        },
        [startEdit],
    );

    const cancelEdit = React.useCallback(() => {
        setEditIdx(null);
        setEditText("");
    }, []);

    const commitEdit = React.useCallback(
        (idx: number) => {
            if (!contentId) return;

            const trimmed = editText.trim();

            if (!trimmed) {
                cancelEdit();
                return;
            }

            ensurePatchDescs();
            updateDescription(contentId, idx, trimmed);

            setEditIdx(null);
            setEditText("");
        },
        [contentId, editText, ensurePatchDescs, updateDescription, cancelEdit],
    );

    const startAdd = React.useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();

        if (clickTimerRef.current) {
            window.clearTimeout(clickTimerRef.current);
            clickTimerRef.current = null;
        }

        setEditIdx(null);
        setDeleteIdx(null);
        setIsAdding(true);
        setNewText("");
    }, []);

    const cancelAdd = React.useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();

        setIsAdding(false);
        setNewText("");
    }, []);

    const commitAdd = React.useCallback(
        (e?: React.MouseEvent) => {
            e?.stopPropagation();

            const trimmed = newText.trim();
            if (!contentId) return;

            if (!trimmed) {
                cancelAdd();
                return;
            }

            ensurePatchDescs();

            const created = {
                _id: makeObjectId(),
                description: trimmed,
            };

            const nextDescs = [...editingDescs, created];

            setDescriptions(contentId, nextDescs);
            setSelectedPd(nextDescs.length - 1);
            onSelectDescriptionId?.(created._id);

            setIsAdding(false);
            setNewText("");
        },
        [
            contentId,
            newText,
            ensurePatchDescs,
            editingDescs,
            setDescriptions,
            setSelectedPd,
            onSelectDescriptionId,
            cancelAdd,
        ],
    );

    const confirmDelete = React.useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();

            if (deleteIdx === null || !contentId) return;

            ensurePatchDescs();

            const nextDescs = editingDescs.filter((_, idx) => idx !== deleteIdx);

            setDescriptions(contentId, nextDescs);

            let nextSelectedIdx = selectedPd;

            if (selectedPd === deleteIdx) {
                nextSelectedIdx = Math.max(0, deleteIdx - 1);
            } else if (selectedPd > deleteIdx) {
                nextSelectedIdx = selectedPd - 1;
            }

            setSelectedPd(nextSelectedIdx);
            onSelectDescriptionId?.(
                String(nextDescs?.[nextSelectedIdx]?._id ?? ""),
            );

            if (editIdx === deleteIdx) {
                cancelEdit();
            }

            setDeleteIdx(null);
        },
        [
            deleteIdx,
            contentId,
            ensurePatchDescs,
            editingDescs,
            setDescriptions,
            selectedPd,
            setSelectedPd,
            onSelectDescriptionId,
            editIdx,
            cancelEdit,
        ],
    );

    const cancelDelete = React.useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteIdx(null);
    }, []);

    const handlePressChange = React.useCallback(
        (value: string) => {
            if (!contentId) return;

            const next = editingDescs.length
                ? editingDescs.map((item, idx) =>
                    idx === 0 ? { ...item, description: value } : item,
                )
                : [{ _id: "", description: value }];

            setDescriptions(contentId, next);
        },
        [contentId, editingDescs, setDescriptions],
    );

    if (!contentId) {
        return (
            <td className="tableBase__td">
                <p className="hidden-text desc">—</p>
            </td>
        );
    }

    return (
        <td className="tableBase__td">
            {group !== "press" ? (
                <Dropdown
                    isOpen={isOpen}
                    onToggle={onToggle}
                    selected={<p className="hidden-text desc">{safeSelectedText}</p>}
                >
                    <div
                        className="post-description-block"
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <ul className="dropdown-list">
                            {editingDescs.map((desc, idx) => (
                                <li
                                    className="desc-li"
                                    key={desc?._id ?? idx}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={() => handleItemClick(idx)}
                                    onDoubleClick={(e) =>
                                        handleItemDoubleClick(
                                            e,
                                            idx,
                                            desc.description ?? "",
                                        )
                                    }
                                >
                                    <span
                                        className={selectedPd === idx ? "active" : ""}
                                    >
                                        {idx + 1}
                                    </span>

                                    {editIdx === idx ? (
                                        <input
                                            className="edit-desc"
                                            autoFocus
                                            value={editText}
                                            onClick={(e) => e.stopPropagation()}
                                            onMouseDown={(e) => e.stopPropagation()}
                                            onDoubleClick={(e) => e.stopPropagation()}
                                            onChange={(e) =>
                                                setEditText(e.target.value)
                                            }
                                            onBlur={() => commitEdit(idx)}
                                            onKeyDown={(e) => {
                                                e.stopPropagation();

                                                if (e.key === "Enter") {
                                                    commitEdit(idx);
                                                }

                                                if (e.key === "Escape") {
                                                    cancelEdit();
                                                }
                                            }}
                                        />
                                    ) : (
                                        <p
                                            className="edit-desc"
                                            title={desc?.description}
                                        >
                                            {desc?.description}
                                        </p>
                                    )}

                                    {deleteIdx === idx ? (
                                        <div
                                            className="confirm-delete"
                                            onClick={(e) => e.stopPropagation()}
                                            onMouseDown={(e) =>
                                                e.stopPropagation()
                                            }
                                        >
                                            <img
                                                src={check}
                                                alt=""
                                                onClick={confirmDelete}
                                                style={{ cursor: "pointer" }}
                                            />
                                            <img
                                                src={x}
                                                alt=""
                                                onClick={cancelDelete}
                                                style={{ cursor: "pointer" }}
                                            />
                                        </div>
                                    ) : (
                                        <img
                                            className="trash"
                                            src={trash}
                                            alt=""
                                            onClick={(e) => {
                                                e.stopPropagation();

                                                if (clickTimerRef.current) {
                                                    window.clearTimeout(
                                                        clickTimerRef.current,
                                                    );
                                                    clickTimerRef.current = null;
                                                }

                                                setEditIdx(null);
                                                setEditText("");
                                                setDeleteIdx(idx);
                                            }}
                                        />
                                    )}
                                </li>
                            ))}

                            {isAdding && (
                                <li
                                    key="__new__"
                                    onClick={(e) => e.stopPropagation()}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    style={{ cursor: "default" }}
                                >
                                    <span>{editingDescs.length + 1}</span>

                                    <input
                                        autoFocus
                                        className="edit-desc"
                                        value={newText}
                                        placeholder={`New ${groupTitle(group)}...`}
                                        onChange={(e) =>
                                            setNewText(e.target.value)
                                        }
                                        onClick={(e) => e.stopPropagation()}
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onDoubleClick={(e) =>
                                            e.stopPropagation()
                                        }
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
                                        className="confirm-delete"
                                        onClick={(e) => e.stopPropagation()}
                                        onMouseDown={(e) =>
                                            e.stopPropagation()
                                        }
                                    >
                                        <img
                                            src={check}
                                            alt=""
                                            onClick={commitAdd}
                                            style={{ cursor: "pointer" }}
                                        />
                                        <img
                                            src={x}
                                            alt=""
                                            onClick={cancelAdd}
                                            style={{ cursor: "pointer" }}
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
                                <p>Add new {groupTitle(group)}</p>
                            </div>
                        )}
                    </div>
                </Dropdown>
            ) : (
                <input
                    className="hidden-text desc"
                    value={editingDescs?.[0]?.description ?? ""}
                    onChange={(e) => handlePressChange(e.target.value)}
                    placeholder="Artwork link"
                />
            )}
        </td>
    );
});