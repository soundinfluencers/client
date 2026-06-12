import React from "react";

import type {
    EditableCampaignContentItem,
    SelectedCampaignContentItem,
} from "@/entities/client-side/campaign/store/campaign.store";
import type { CampaignTableRow } from "../../model/campaign-table.types";

import { Dropdown } from "@/shared/ui/dropdown-table/dropdowns-table.tsx";
import { Modal } from "@/components/ui/modal-fix/Modal";

import eye from "@/assets/icons/eye.svg";
import plus from "@/assets/icons/plus.svg";
import trash from "@/assets/icons/trash-2.svg";

import styles from "./cells.module.scss";
import {ButtonMain, ButtonSecondary} from "@/shared/ui";

type Props = {
    row: CampaignTableRow;
    canSelect: boolean;
    canManage: boolean;
    setAccountSelectedContent?: (
        accountKey: string,
        selected: SelectedCampaignContentItem | null,
    ) => void;
    setContentField?: (
        contentId: string,
        field: "mainLink" | "taggedUser" | "taggedLink" | "additionalBrief",
        value: string,
    ) => void;
    addContentItem?: (
        socialMedia: string,
        payload?: Partial<EditableCampaignContentItem>,
        inheritFromContentId?: string,
    ) => {
        contentId: string;
        firstDescriptionId: string;
    };
    removeContentItem?: (contentId: string) => void;
};

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

const getLabel = (group: CampaignTableRow["group"]) => {
    if (group === "main") return "Video";
    if (group === "music") return "Song";
    return "Press";
};

const getSelectedRefFromItem = (
    item?: EditableCampaignContentItem | null,
): SelectedCampaignContentItem | null => {
    if (!item?._id) return null;

    return {
        campaignContentItemId: String(item._id),
        descriptionId: String(item.descriptions?.[0]?._id ?? ""),
    };
};

export const ContentTableCell: React.FC<Props> = ({
                                                      row,
                                                      canSelect,
                                                      canManage,
                                                      setAccountSelectedContent,
                                                      setContentField,
                                                      addContentItem,
                                                      removeContentItem,
                                                  }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [previewModalOpen, setPreviewModalOpen] = React.useState(false);
    const [addModalOpen, setAddModalOpen] = React.useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);

    const [previewIndex, setPreviewIndex] = React.useState(0);
    const [deleteIndex, setDeleteIndex] = React.useState(-1);
    const [newValue, setNewValue] = React.useState("");

    const label = getLabel(row.group);

    const platformItems = row.platformItems ?? [];
    const selectedIndex = row.selectedContentIndex ?? 0;
    const selectedItem = row.selectedItem ?? platformItems[selectedIndex] ?? null;

    const selectedLink = selectedItem?.mainLink ?? "";
    const previewLink = platformItems[previewIndex]?.mainLink ?? "";

    const selectedRef = row.account.selectedCampaignContentItem;
    const selectedAccountKey = row.accountKey;

    const commitSelectedItem = React.useCallback(
        (nextItem?: EditableCampaignContentItem | null) => {
            if (!setAccountSelectedContent) return;

            setAccountSelectedContent(
                selectedAccountKey,
                getSelectedRefFromItem(nextItem),
            );
        },
        [selectedAccountKey, setAccountSelectedContent],
    );

    React.useEffect(() => {
        if (!setAccountSelectedContent) return;
        if (!platformItems.length) return;
        if (selectedRef?.campaignContentItemId) return;

        const firstItem = platformItems[0];
        const firstRef = getSelectedRefFromItem(firstItem);

        if (firstRef) {
            setAccountSelectedContent(selectedAccountKey, firstRef);
        }
    }, [
        platformItems,
        selectedRef?.campaignContentItemId,
        selectedAccountKey,
        setAccountSelectedContent,
    ]);

    const onSelectIndex = React.useCallback(
        (nextIndex: number) => {
            const nextItem = platformItems[nextIndex];
            if (!nextItem) return;

            commitSelectedItem(nextItem);
            setIsOpen(false);
        },
        [platformItems, commitSelectedItem],
    );

    const onOpenPreview = React.useCallback(
        (index: number, e?: React.MouseEvent) => {
            e?.stopPropagation();
            setPreviewIndex(index);
            setPreviewModalOpen(true);
        },
        [],
    );

    const onClosePreview = React.useCallback(() => {
        setPreviewModalOpen(false);
    }, []);

    const onOpenAdd = React.useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        setNewValue("");
        setAddModalOpen(true);
    }, []);

    const onCloseAdd = React.useCallback(() => {
        setAddModalOpen(false);
        setNewValue("");
    }, []);

    const onOpenDelete = React.useCallback(
        (index: number, e?: React.MouseEvent) => {
            e?.stopPropagation();
            setDeleteIndex(index);
            setDeleteModalOpen(true);
        },
        [],
    );

    const onCloseDelete = React.useCallback(() => {
        setDeleteModalOpen(false);
        setDeleteIndex(-1);
    }, []);

    const onAdd = React.useCallback(() => {
        const trimmed = newValue.trim();

        if (!trimmed || !addContentItem) return;

        const created = addContentItem(
            row.account.socialMedia,
            {
                mainLink: trimmed,
                descriptions: [
                    {
                        _id: createObjectId(),
                        description: "",
                    },
                ],
                taggedUser: "",
                taggedLink: "",
                additionalBrief: "",
                profileType: selectedItem?.profileType ?? row.account.profileType,
            },
            selectedItem?._id,
        );

        setNewValue("");
        setAddModalOpen(false);
        setIsOpen(false);

        if (created.contentId && setAccountSelectedContent) {
            setAccountSelectedContent(selectedAccountKey, {
                campaignContentItemId: created.contentId,
                descriptionId: created.firstDescriptionId,
            });
        }
    }, [
        newValue,
        addContentItem,
        row.account.socialMedia,
        row.account.profileType,
        selectedItem?._id,
        selectedItem?.profileType,
        selectedAccountKey,
        setAccountSelectedContent,
    ]);

    const onDeleteCurrent = React.useCallback(() => {
        const deletingItem = platformItems[deleteIndex];

        if (!deletingItem?._id || !removeContentItem) return;

        const deletingId = String(deletingItem._id);
        const nextItems = platformItems.filter(
            (platformItem) => String(platformItem._id) !== deletingId,
        );

        removeContentItem(deletingId);

        if (setAccountSelectedContent) {
            if (!nextItems.length) {
                setAccountSelectedContent(selectedAccountKey, null);
            } else {
                const fallbackIndex = deleteIndex > 0 ? deleteIndex - 1 : 0;
                const fallbackItem = nextItems[fallbackIndex] ?? nextItems[0];

                setAccountSelectedContent(
                    selectedAccountKey,
                    getSelectedRefFromItem(fallbackItem),
                );
            }
        }

        setDeleteModalOpen(false);
        setDeleteIndex(-1);
        setIsOpen(false);
    }, [
        deleteIndex,
        platformItems,
        removeContentItem,
        selectedAccountKey,
        setAccountSelectedContent,
    ]);

    const previewModal = previewModalOpen && (
        <Modal isShowCloseButton={false} className={styles.modalCard} onClose={onClosePreview}>
            <div className={styles.modalCardContent}>
                <h2>
                    {label} {previewIndex + 1}
                </h2>

                <input type="text" value={previewLink} readOnly />
            </div>
        </Modal>
    );

    if (!platformItems.length) {
        return <p className={styles.empty}>—</p>;
    }

    if (row.group === "press") {
        if (!canManage) {
            if (!selectedLink) {
                return <p className={styles.empty}>—</p>;
            }

            return (
                <a
                    className={styles.link}
                    href={normalizeLink(selectedLink)}
                    target="_blank"
                    rel="noreferrer"
                >
                    {selectedLink}
                </a>
            );
        }

        return (
            <input
                className={styles.input}
                value={selectedItem?.mainLink ?? ""}
                onChange={(e) => {
                    if (!selectedItem?._id || !setContentField) return;

                    setContentField(
                        String(selectedItem._id),
                        "mainLink",
                        e.target.value,
                    );
                }}
                placeholder="Paste press link"
            />
        );
    }

    if (!canSelect) {
        return (
            <>
                <div className={`${styles.baseLine} ${styles.flex}`}>
                    <button
                        type="button"
                        onClick={(e) => onOpenPreview(selectedIndex, e)}
                        className={styles.eye}
                    >
                        <img src={eye} alt="" />
                    </button>

                    <p className={styles.truncate} title={selectedLink}>
                        {selectedLink ? `${label} ${selectedIndex + 1}` : "—"}
                    </p>
                </div>

                {previewModal}
            </>
        );
    }

    if (!canManage) {
        if (platformItems.length === 1) {
            return (
                <>
                    <div className={`${styles.baseLine} ${styles.flex}`}>
                        <button
                            type="button"
                            onClick={(e) => onOpenPreview(0, e)}
                            className={styles.eye}
                        >
                            <img src={eye} alt="" />
                        </button>

                        <p className={styles.truncate} title={selectedLink}>
                            {selectedLink ? `${label} 1` : "—"}
                        </p>
                    </div>

                    {previewModal}
                </>
            );
        }

        return (
            <>
                <Dropdown
                    isOpen={isOpen}
                    onOpenChange={setIsOpen}
                    content
                    selected={
                        <div className={styles.contentCell}>
                            <button
                                type="button"
                                onClick={(e) => onOpenPreview(selectedIndex, e)}
                                className={styles.eye}
                            >
                                <img src={eye} alt="" />
                            </button>

                            <p className={styles.truncate} title={selectedLink}>
                                {selectedLink
                                    ? `${label} ${selectedIndex + 1}`
                                    : "—"}
                            </p>
                        </div>
                    }
                >
                    <ul className={styles.contentList}>
                        {platformItems.map((platformItem, index) => (
                            <li
                                key={platformItem._id}
                                className={`${styles.contentItem} ${
                                    selectedIndex === index ? styles.active : ""
                                }`}
                                onClick={() => onSelectIndex(index)}
                            >
                                <button
                                    type="button"
                                    onClick={(e) => onOpenPreview(index, e)}
                                    className={styles.eye}
                                >
                                    <img src={eye} alt="" />
                                </button>

                                <p
                                    className={styles.truncate}
                                    title={platformItem.mainLink ?? ""}
                                >
                                    {platformItem.mainLink
                                        ? `${label} ${index + 1}`
                                        : "—"}
                                </p>
                            </li>
                        ))}
                    </ul>
                </Dropdown>

                {previewModal}
            </>
        );
    }

    return (
        <>
            <Dropdown
                isOpen={isOpen}
                onOpenChange={setIsOpen}
                content
                selected={
                    <div className={styles.contentCell}>
                        <button
                            type="button"
                            onClick={(e) => onOpenPreview(selectedIndex, e)}
                            className={styles.eye}
                        >
                            <img src={eye} alt="" />
                        </button>

                        <p className={styles.truncate} title={selectedLink}>
                            {selectedLink
                                ? `${label} ${selectedIndex + 1}`
                                : "—"}
                        </p>
                    </div>
                }
            >
                <div className={styles.contentDropdown}>
                    <ul className={styles.contentList}>
                        {platformItems.map((platformItem, index) => (
                            <li
                                key={platformItem._id}
                                className={`${styles.contentItem} ${
                                    selectedIndex === index ? styles.active : ""
                                }`}
                                onClick={() => onSelectIndex(index)}
                            >
                                <button
                                    type="button"
                                    onClick={(e) => onOpenPreview(index, e)}
                                    className={styles.eye}
                                >
                                    <img src={eye} alt="" />
                                </button>

                                <p
                                    className={styles.truncate}
                                    title={platformItem.mainLink ?? ""}
                                >
                                    {platformItem.mainLink
                                        ? `${label} ${index + 1}`
                                        : "—"}
                                </p>

                                <button
                                    type="button"
                                    className={styles.trash}
                                    onClick={(e) => onOpenDelete(index, e)}
                                >
                                    <img src={trash} alt="" />
                                </button>
                            </li>
                        ))}
                    </ul>

                    <button
                        type="button"
                        className={styles.addButton}
                        onClick={onOpenAdd}
                    >
                        <span className={styles.addIcon}>
                            <img src={plus} alt="" />
                        </span>

                        <span>Add new {label.toLowerCase()}</span>
                    </button>
                </div>
            </Dropdown>

            {previewModal}

            {addModalOpen && (
                <Modal isShowCloseButton={false} className={styles.modalCard} onClose={onCloseAdd}>
                    <div className={styles.modalCardContent} >
                        <h2>Add {label.toLowerCase()}</h2>

                        <input
                            autoFocus
                            value={newValue}
                            onChange={(e) => setNewValue(e.target.value)}
                            type="text"
                            placeholder={`Paste ${label.toLowerCase()} link...`}
                        />

                        <div className={styles.modalActions}>
                            <ButtonMain className={styles.btn} onClick={onCloseAdd} text={"Cancel"}/>


                            <ButtonSecondary className={styles.btn} onClick={onAdd} text={"Create"} />
                        </div>
                    </div>
                </Modal>
            )}

            {deleteModalOpen && (
                <Modal isShowCloseButton={false} className={styles.modalCard} onClose={onCloseDelete}>
                    <div className={styles.modalCardContent}>
                        <h2>
                            Are you sure you want to <br /> delete this{" "}
                            {label.toLowerCase()}?
                        </h2>

                        <p>You won’t be able to restore this.</p>

                        <div className={styles.modalActions}>
                            <ButtonMain className={styles.btn} onClick={onCloseDelete} text={"Cancel"}/>
                            <ButtonSecondary className={styles.btn} onClick={onDeleteCurrent} text={"Delete"} />
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
};