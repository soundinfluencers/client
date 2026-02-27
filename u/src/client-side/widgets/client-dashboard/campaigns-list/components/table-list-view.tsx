import { getSocialMediaIcon } from "@/constants/social-medias";
import trash from "@/assets/icons/trash-2.svg";
import type {
  CampaignForList,
  CampaignStatusType,
} from "@/types/client/dashboard/campaign.types";
import { deleteDraft } from "@/api/client/campaign/draft.api";
import { TableCardSkeleton } from "@/components/ui/skeletons/table-card-skeleton";
import { NoData } from "@/components/ui/no-array/no-data";

interface TableListViewProps {
  thead: string[];
  list: CampaignForList[];
  onOpen: (id: string, status: CampaignStatusType) => Promise<void> | void;
  isLoading: boolean;
}
const COLS = [287, 250, 515, 100] as const;
export const TableListView: React.FC<TableListViewProps> = ({
  thead,
  list,
  onOpen,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="table-list">
        {Array.from({ length: 2 }).map((_, index) => (
          <TableCardSkeleton key={index} />
        ))}
      </div>
    );
  }
  if (list.length < 1) {
    return (
      <NoData>
        {" "}
        <h2>No Campaigns for this status right now</h2>
        <p>You can still create a campaign</p>
      </NoData>
    );
  }
  const handleDeleteDraft = async (e: React.MouseEvent, draftId: string) => {
    e.stopPropagation();
    try {
      await deleteDraft(draftId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="table-list">
      <div className="table-list__header">
        {thead.map((th, i) => (
          <div
            key={i}
            className="table-list__header-data"
            style={{ width: COLS[i] }}>
            <p>{th}</p>
          </div>
        ))}
      </div>

      {list.map((tb) => (
        <div
          onClick={() => onOpen(tb._id, tb.status)}
          key={tb._id}
          className="table-list__body-row">
          <div className="table-list__body-data" style={{ width: COLS[0] }}>
            <div className="header">
              <div className="socialMedia">
                <img
                  className="home-campaigns-table__icon"
                  src={getSocialMediaIcon(tb.socialMedia)}
                  alt=""
                />
                <p>{tb.status ?? ""}</p>
              </div>

              {tb.status === "draft" && (
                <button
                  type="button"
                  onClick={(e) => handleDeleteDraft(e, tb._id)}
                  aria-label="Delete draft"
                  className="icon-button">
                  <img src={trash} alt="" />
                </button>
              )}
            </div>
          </div>

          <div
            className="table-list__body-data date-post"
            style={{ width: COLS[1] }}>
            <p>{tb.creationDate ?? ""}</p>
          </div>

          <div className="table-list__body-data" style={{ width: COLS[2] }}>
            <p>{tb.campaignName ?? ""}</p>
          </div>

          <div className="table-list__body-data" style={{ width: COLS[3] }}>
            <p>{tb.price ? `${tb.price}€` : ""}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
