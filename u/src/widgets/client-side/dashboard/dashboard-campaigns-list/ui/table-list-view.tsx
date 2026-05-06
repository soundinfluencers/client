import { useState } from "react";
import { getSocialMediaIcon } from "@/constants/social-medias";
import trash from "@/assets/icons/trash-2.svg";
import { TableCardSkeleton } from "@components/ui/skeletons/table-card-skeleton";
import styles from "./dashboard-campaigns-list.module.scss";
import type { CampaignListItem, CampaignStatus } from "@/entities/client-side/dashboard/model/campaign.types.ts";
import type { SocialMediaType } from "@/shared/types/utils/constants.types.ts";
import {
    useDeleteCampaignDraft
} from "@/features/client-side/dashboard/delete-campaign-draft/model/use-delete-campaign-draft.ts";
import { DeleteDraftModal } from "./delete-draft-modal";

type Props = {
    thead: string[];
    list: CampaignListItem[];
    onOpen: (id: string, status: CampaignStatus) => Promise<void> | void;
    isLoading: boolean;
};

const COLS = [287, 250, 515, 100] as const;

export const TableListView = ({ thead, list, onOpen, isLoading }: Props) => {
    const { deleteDraft, isDeleting } = useDeleteCampaignDraft();
    const [draftIdToDelete, setDraftIdToDelete] = useState<string | null>(null);

    const handleOpenDeleteModal = (
        event: React.MouseEvent<HTMLButtonElement>,
        draftId: string,
    ) => {
        event.stopPropagation();
        setDraftIdToDelete(draftId);
    };

    const handleCloseDeleteModal = () => {
        setDraftIdToDelete(null);
    };

    const handleConfirmDelete = () => {
        if (!draftIdToDelete) return;

        deleteDraft(draftIdToDelete, {
            onSuccess: () => {
                handleCloseDeleteModal();
            },
        });
    };

    if (isLoading) {
        return (
            <div className={styles.tableList}>
                {Array.from({ length: 2 }).map((_, index) => (
                    <TableCardSkeleton key={index} />
                ))}
            </div>
        );
    }

    return (
        <>
            <div className={styles.tableList}>
                <div className={styles.tableHeader}>
                    {thead.map((th, i) => (
                        <div
                            key={th}
                            className={styles.tableHeaderCell}
                            style={{ width: COLS[i] }}
                        >
                            <p>{th}</p>
                        </div>
                    ))}
                </div>

                {list.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => onOpen(item.id, item.status)}
                        className={styles.tableRow}
                    >
                        <div className={styles.tableCell} style={{ width: COLS[0] }}>
                            <div className={styles.statusCell}>
                                <div className={styles.socialMeta}>
                                    <img
                                        src={getSocialMediaIcon(item.socialMedia as SocialMediaType) || ""}
                                        alt=""
                                    />
                                    <p>{item.status}</p>
                                </div>

                                {item.status === "draft" && (
                                    <button
                                        type="button"
                                        onClick={(e) => handleOpenDeleteModal(e, item.id)}
                                        aria-label="Delete draft"
                                        className={styles.iconButton}
                                    >
                                        <img src={trash} alt="" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className={styles.tableCell} style={{ width: COLS[1] }}>
                            <p>{item.creationDate}</p>
                        </div>

                        <div className={styles.tableCell} style={{ width: COLS[2] }}>
                            <p>{item.campaignName}</p>
                        </div>

                        <div className={styles.tableCell} style={{ width: COLS[3] }}>
                            <p>{item.price ? `${item.price}€` : ""}</p>
                        </div>
                    </div>
                ))}
            </div>

            <DeleteDraftModal
                isOpen={!!draftIdToDelete}
                isDeleting={isDeleting}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
};