import { useState } from "react";
import { getSocialMediaIcon } from "@/constants/social-medias";
import trash from "@/assets/icons/trash-2.svg";
import { CardSkeleton } from "@components/ui/skeletons/card-skeleton";
import {
    useDeleteCampaignDraft
} from "@/features/client-side/dashboard/delete-campaign-draft/model/use-delete-campaign-draft.ts";
import { DeleteDraftModal } from "./delete-draft-modal";
import styles from "./dashboard-campaigns-list.module.scss";
import type { CampaignListItem, CampaignStatus } from "@/entities/client-side/dashboard/model/campaign.types.ts";
import type { SocialMediaType } from "@/shared/types/utils/constants.types.ts";

type Props = {
    list: CampaignListItem[];
    onOpen: (id: string, status: CampaignStatus) => Promise<void> | void;
    isLoading: boolean;
};

export const GridListView = ({ list, onOpen, isLoading }: Props) => {
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
            <div className={styles.grid}>
                {Array.from({ length: 4 }).map((_, index) => (
                    <CardSkeleton key={index} />
                ))}
            </div>
        );
    }

    return (
        <>
            <div className={styles.grid}>
                {list.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => onOpen(item.id, item.status)}
                        className={styles.gridItem}
                    >
                        <div className={styles.gridItemHeader}>
                            <div className={styles.gridItemInfo}>
                                <div className={styles.gridItemMeta}>
                                    <img
                                        src={getSocialMediaIcon(item.socialMedia as SocialMediaType) || ""}
                                        alt=""
                                    />
                                    <p>{item.status}</p>
                                </div>
                                <div className={styles.gridItemDate}>
                                    <p>{item.creationDate}</p>
                                </div>
                            </div>

                            <div className={styles.gridItemPrice}>
                                <p>{item.price ? `${item.price}€` : ""}</p>
                            </div>
                        </div>

                        <div className={styles.gridFooter}>
                            <div className={styles.gridItemTitle}>
                                <p>{item.campaignName}</p>
                            </div>

                            {item.status === "draft" && (
                                <button
                                    type="button"
                                    onClick={(e) => handleOpenDeleteModal(e, item.id)}
                                >
                                    <img src={trash} alt="" />
                                </button>
                            )}
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