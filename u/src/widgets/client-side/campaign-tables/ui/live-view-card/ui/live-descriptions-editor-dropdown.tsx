import React from "react";

import styles from "./live-view-card.module.scss";
import plus from "@/assets/icons/plus.svg";
import {Dropdown} from "@/shared/ui/dropdown-table/dropdowns-table.tsx";


type Desc = {
    _id?: string;
    description: string;
};

type Props = {
    title?: string;
    canEdit: boolean;
    descriptions: Desc[];
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    selectedIdx: number;
    setSelectedIdx: (v: number) => void;
    onAdd?: (text: string) => void;
    onUpdate?: (descriptionId: string, value: string) => void;
    onDelete?: (descriptionId: string) => void;
};

export const LiveDescriptionsEditorDropdown: React.FC<Props> = ({
                                                                    title = "Post description",
                                                                    canEdit,
                                                                    descriptions,
                                                                    isOpen,
                                                                    onOpenChange,
                                                                    selectedIdx,
                                                                    setSelectedIdx,
                                                                    onAdd,
                                                                    onUpdate,
                                                                    onDelete,
                                                                }) => {
    const [isAdding, setIsAdding] = React.useState(false);
    const [newText, setNewText] = React.useState("");
    const [editId, setEditId] = React.useState<string | null>(null);
    const [editText, setEditText] = React.useState("");

    const selectedText =
        descriptions?.[selectedIdx]?.description ||
        descriptions?.[0]?.description ||
        "—";

    return (
        <div className={styles.section}>
            <h3>{title}</h3>

            <Dropdown
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                selected={
                    <div className={styles.fillInput}>
                        <p className={styles.hiddenText}>{selectedText}</p>
                    </div>
                }
            >
                <div className={styles.dropdownBlock}>
                    <ul className={styles.dropdownList}>
                        {descriptions.map((desc, idx) => (
                            <li
                                key={desc._id ?? idx}
                                className={styles.dropdownItem}
                                onClick={() => {
                                    setSelectedIdx(idx);
                                    onOpenChange(false);
                                }}
                            >
                                <span
                                    className={`${styles.indexBadge} ${
                                        selectedIdx === idx ? styles.indexBadgeActive : ""
                                    }`}
                                >
                                    {idx + 1}
                                </span>

                                {canEdit && editId === String(desc._id) ? (
                                    <input
                                        autoFocus
                                        value={editText}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => setEditText(e.target.value)}
                                        onBlur={() => {
                                            if (desc._id && onUpdate) {
                                                onUpdate(String(desc._id), editText);
                                            }
                                            setEditId(null);
                                            setEditText("");
                                        }}
                                    />
                                ) : (
                                    <p
                                        className={styles.hiddenText}
                                        onClick={(e) => {
                                            if (!canEdit) return;
                                            e.stopPropagation();
                                            setEditId(String(desc._id ?? ""));
                                            setEditText(desc.description ?? "");
                                        }}
                                    >
                                        {desc.description || "—"}
                                    </p>
                                )}

                                {canEdit && desc._id && onDelete ? (
                                    <button
                                        type="button"
                                        className={styles.trashBtn}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(String(desc._id));
                                        }}
                                    >
                                        delete
                                    </button>
                                ) : null}
                            </li>
                        ))}
                    </ul>

                    {canEdit && onAdd && (
                        <>
                            {isAdding ? (
                                <div className={styles.addForm}>
                                    <input
                                        autoFocus
                                        value={newText}
                                        onChange={(e) => setNewText(e.target.value)}
                                        placeholder={`New ${title.toLowerCase()}...`}
                                    />
                                    <div className={styles.addActions}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const trimmed = newText.trim();
                                                if (!trimmed) {
                                                    setIsAdding(false);
                                                    setNewText("");
                                                    return;
                                                }

                                                onAdd(trimmed);
                                                setIsAdding(false);
                                                setNewText("");
                                            }}
                                        >
                                            Save
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsAdding(false);
                                                setNewText("");
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    className={styles.addDesc}
                                    onClick={() => setIsAdding(true)}
                                >
                                    <span className={styles.addDescIcon}>
                                        <img src={plus} alt="" />
                                    </span>
                                    <p>Add new {title.toLowerCase()}</p>
                                </button>
                            )}
                        </>
                    )}
                </div>
            </Dropdown>
        </div>
    );
};