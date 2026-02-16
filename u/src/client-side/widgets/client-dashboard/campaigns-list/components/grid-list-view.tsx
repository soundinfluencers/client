import { getSocialMediaIcon } from "@/constants/social-medias";
import trash from "@/assets/icons/trash-2.svg";
import type {
  CampaignForList,
  CampaignStatusType,
} from "@/types/client/dashboard/campaign.types";

import { CardSkeleton } from "@/components/ui/skeletons/card-skeleton";
import { useDeleteDraftMutation } from "@/client-side/react-query";

interface GridListViewProps {
  list: CampaignForList[];
  onOpen: (id: string, status: CampaignStatusType) => Promise<void> | void;
  isLoading: boolean;
}

export const GridListView: React.FC<GridListViewProps> = ({
  list,
  onOpen,
  isLoading,
}) => {
  const { mutate: deleteDraftMutate } = useDeleteDraftMutation();

  const handleDeleteDraft = (e: React.MouseEvent, draftId: string) => {
    e.stopPropagation();
    deleteDraftMutate(draftId);
  };

  if (isLoading) {
    return (
      <div className="home-campaigns-grid">
        {Array.from({ length: 12 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="home-campaigns-grid">
      {list.map((item) => (
        <div
          onClick={() => onOpen(item._id, item.status)}
          key={item._id}
          className="home-campaigns-grid__item">
          <div className="home-campaigns-grid__item-header">
            <div className="home-campaigns-grid__item-info">
              <div className="home-campaigns-grid__item-meta">
                <img src={getSocialMediaIcon(item.socialMedia)} alt="" />
                <p>{item.status ?? "—"}</p>
              </div>

              <div className="home-campaigns-grid__item-date">
                <p>{item.creationDate ?? "-"}</p>
              </div>
            </div>

            <div className="home-campaigns-grid__item-price">
              <p>{item.price ? `${item.price}€` : "—"}</p>
            </div>
          </div>

          <div className="home-campaigns-grid__footer">
            <div className="home-campaigns-grid__item-title">
              <p>{item.campaignName ?? "-"}</p>
            </div>

            {item.status === "draft" && (
              <button onClick={(e) => handleDeleteDraft(e, item._id)}>
                <img src={trash} alt="" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
