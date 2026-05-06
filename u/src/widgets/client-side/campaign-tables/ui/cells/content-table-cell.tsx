import React from "react";
import type {
    CampaignContentItem,
    SelectedCampaignContentRef,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.types";
import type { StrategyRow } from "../../model/campaign-strategy.types";
import { createObjectId } from "../../model/campaign-strategy.helpers";
import {Dropdown} from "@/shared/ui/dropdown-table/dropdowns-table.tsx";

import { Modal } from "@components/ui/modal-fix/Modal";

import eye from "@/assets/icons/eye.svg";
import plus from "@/assets/icons/plus.svg";
import trash from "@/assets/icons/trash-2.svg";

type Props = {
    row: StrategyRow;
    canSelect: boolean;
    canManage: boolean;
    setAccountSelectedContent?: (
        accountId: string,
        selected: SelectedCampaignContentRef | null,
    ) => void;
    setContentField?: (
        contentId: string,
        field: "mainLink" | "taggedUser" | "taggedLink" | "additionalBrief",
        value: string,
    ) => void;
    addContentItem?: (
        socialMedia: string,
        payload?: Partial<CampaignContentItem>,
        inheritFromContentId?: string,
    ) => { contentId: string; firstDescriptionId: string };
    removeContentItem?: (contentId: string) => void;
};

const normalizeLink = (value: string) =>
    value.startsWith("http") ? value : `https://${value}`;

const getLabel = (group: StrategyRow["group"]) => {
    if (group === "main") return "Video";
    if (group === "music") return "Song";
    return "Press";
};

const getSelectedRefFromItem = (
    item?: CampaignContentItem | null,
): SelectedCampaignContentRef | null => {
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

    const selectedAccountId = String(row.account.accountId);

    const commitSelectedItem = React.useCallback(
        (nextItem?: CampaignContentItem | null) => {
            if (!setAccountSelectedContent) return;

            const nextRef = getSelectedRefFromItem(nextItem);
            setAccountSelectedContent(selectedAccountId, nextRef);
        },
        [selectedAccountId, setAccountSelectedContent],
    );

    React.useEffect(() => {
        if (!setAccountSelectedContent) return;
        if (!platformItems.length) return;
        if (selectedRef?.campaignContentItemId) return;

        const firstItem = platformItems[0];
        const firstRef = getSelectedRefFromItem(firstItem);

        if (firstRef) {
            setAccountSelectedContent(selectedAccountId, firstRef);
        }
    }, [
        platformItems,
        selectedRef?.campaignContentItemId,
        selectedAccountId,
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

    const onOpenPreview = React.useCallback((index: number, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setPreviewIndex(index);
        setPreviewModalOpen(true);
    }, []);

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

    const onOpenDelete = React.useCallback((index: number, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setDeleteIndex(index);
        setDeleteModalOpen(true);
    }, []);

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
                profileType: selectedItem?.profileType,
            },
            selectedItem?._id,
        );

        setNewValue("");
        setAddModalOpen(false);
        setIsOpen(false);

        if (created.contentId && setAccountSelectedContent) {
            setAccountSelectedContent(selectedAccountId, {
                campaignContentItemId: created.contentId,
                descriptionId: created.firstDescriptionId,
            });
        }
    }, [
        newValue,
        addContentItem,
        row.account.socialMedia,
        selectedItem?._id,
        selectedItem?.profileType,
        selectedAccountId,
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
                setAccountSelectedContent(selectedAccountId, null);
            } else {
                const fallbackIndex = deleteIndex > 0 ? deleteIndex - 1 : 0;
                const fallbackItem = nextItems[fallbackIndex] ?? nextItems[0];

                setAccountSelectedContent(
                    selectedAccountId,
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
        selectedAccountId,
        setAccountSelectedContent,
    ]);

    if (!platformItems.length) {
        return <p className="hidden-text">—</p>;
    }

    if (row.group === "press") {
        if (!canManage) {
            if (!selectedLink) {
                return <p className="hidden-text">—</p>;
            }

            return (
                <a
                    className="hidden-text tagged-link"
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
                className="hidden-text"
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
                <div className="content-cell-static no-edit">
                    <span onClick={(e) => onOpenPreview(selectedIndex, e)} className="eye">
                        <img src={eye} alt="" />
                    </span>
                    <p title={selectedLink}>
                        {selectedLink ? `${label} ${selectedIndex + 1}` : "—"}
                    </p>
                </div>

                {previewModalOpen && (
                    <Modal onClose={onClosePreview}>
                        <div className="modal-card">
                            <h2>{label} {selectedIndex + 1}</h2>
                            <input type="text" value={previewLink} readOnly />
                        </div>
                    </Modal>
                )}
            </>
        );
    }

    if (!canManage) {
        if (platformItems.length === 1) {
            return (
                <>
                    <div className="content-cell-static no-edit">
                        <span onClick={(e) => onOpenPreview(0, e)} className="eye">
                            <img src={eye} alt="" />
                        </span>
                        <p title={selectedLink}>
                            {selectedLink ? `${label} 1` : "—"}
                        </p>
                    </div>

                    {previewModalOpen && (
                        <Modal onClose={onClosePreview}>
                            <div className="modal-card">
                                <h2>{label} 1</h2>
                                <input type="text" value={previewLink} readOnly />
                            </div>
                        </Modal>
                    )}
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
                        <div className="content-cell-static">
                            <span
                                onClick={(e) => onOpenPreview(selectedIndex, e)}
                                className="eye"
                            >
                                <img src={eye} alt="" />
                            </span>
                            <p title={selectedLink}>
                                {selectedLink ? `${label} ${selectedIndex + 1}` : "—"}
                            </p>
                        </div>
                    }
                >
                    <ul className="dropdown-list">
                        {platformItems.map((platformItem, index) => (
                            <li
                                key={platformItem._id}
                                className={`content-cell ${
                                    selectedIndex === index ? "active-content" : ""
                                }`}
                                onClick={() => onSelectIndex(index)}
                            >
                                <span
                                    onClick={(e) => onOpenPreview(index, e)}
                                    className="eye"
                                >
                                    <img src={eye} alt="" />
                                </span>

                                <p
                                    className="hidden-text desc-li"
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

                {previewModalOpen && (
                    <Modal onClose={onClosePreview}>
                        <div className="modal-card">
                            <h2>{label} {previewIndex + 1}</h2>
                            <input type="text" value={previewLink} readOnly />
                        </div>
                    </Modal>
                )}
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
                    <div className="content-cell-static">
                        <span
                            onClick={(e) => onOpenPreview(selectedIndex, e)}
                            className="eye"
                        >
                            <img src={eye} alt="" />
                        </span>
                        <p title={selectedLink}>
                            {selectedLink ? `${label} ${selectedIndex + 1}` : "—"}
                        </p>
                    </div>
                }
            >
                <div className="post-description-block">
                    <ul className="dropdown-list">
                        {platformItems.map((platformItem, index) => (
                            <li
                                key={platformItem._id}
                                className={`content-cell ${
                                    selectedIndex === index ? "active-content" : ""
                                }`}
                                onClick={() => onSelectIndex(index)}
                            >
                                <span
                                    onClick={(e) => onOpenPreview(index, e)}
                                    className="eye"
                                >
                                    <img src={eye} alt="" />
                                </span>

                                <p
                                    className="hidden-text desc-li"
                                    title={platformItem.mainLink ?? ""}
                                >
                                    {platformItem.mainLink
                                        ? `${label} ${index + 1}`
                                        : "—"}
                                </p>

                                <img
                                    className="trash"
                                    src={trash}
                                    alt=""
                                    onClick={(e) => onOpenDelete(index, e)}
                                />
                            </li>
                        ))}
                    </ul>

                    <div onClick={onOpenAdd} className="add-video">
                        <div className="add-desc__icon">
                            <img src={plus} alt="" />
                        </div>
                        <p>Add new {label.toLowerCase()}</p>
                    </div>
                </div>
            </Dropdown>

            {previewModalOpen && (
                <Modal onClose={onClosePreview}>
                    <div className="modal-card">
                        <h2>{label} {previewIndex + 1}</h2>
                        <input type="text" value={previewLink} readOnly />
                    </div>
                </Modal>
            )}

            {addModalOpen && (
                <Modal onClose={onCloseAdd}>
                    <div className="modal-card">
                        <h2>Add {label.toLowerCase()}</h2>
                        <input
                            autoFocus
                            value={newValue}
                            onChange={(e) => setNewValue(e.target.value)}
                            type="text"
                            placeholder={`Paste ${label.toLowerCase()} link...`}
                        />
                        <div className="modal-card-btn">
                            <button type="button" onClick={onCloseAdd}>
                                Cancel
                            </button>
                            <button type="button" onClick={onAdd}>
                                Create
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {deleteModalOpen && (
                <Modal onClose={onCloseDelete}>
                    <div className="onDeleteModal">
                        <h2>
                            Are you sure you want to <br /> delete this {label.toLowerCase()}?
                        </h2>
                        <p>You won’t be able to restore this.</p>
                        <div className="onDeleteModal-btn">
                            <button type="button" onClick={onCloseDelete}>
                                Cancel
                            </button>
                            <button type="button" onClick={onDeleteCurrent}>
                                Delete
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
};