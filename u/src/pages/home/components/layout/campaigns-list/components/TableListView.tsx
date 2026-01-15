import { getSocialMediaIcon } from "@/constants/social-medias";
import type { CampaignForList } from "@/pages/client/types/dashboard/campaign.types";
import trash from "@/assets/icons/trash-2.svg";

interface TableListViewProps {
  thead: string[];
  list: CampaignForList[];
}

export const TableListView: React.FC<TableListViewProps> = ({
  thead,
  list,
}) => {
  return (
    <div className="table-list">
      <div className="table-list__header">
        {thead.map((th, i) => (
          <div key={i} className="table-list__header-data">
            <p>{th}</p>
          </div>
        ))}
      </div>

      {list.map((tb) => (
        <div key={tb._id} className="table-list__body-row">
          <div className="table-list__body-data">
            <div className="header">
              <div className="socialMedia">
                <img
                  className="home-campaigns-table__icon"
                  src={getSocialMediaIcon(tb.socialMedia)}
                  alt=""
                />
                <p>{tb.status ?? "-"}</p>
              </div>
              {tb.status === "Draft" && <img src={trash} alt="" />}
            </div>
          </div>

          <div className="table-list__body-data date-post">
            <p>{tb.creationDate ?? "-"}</p>
          </div>

          <div className="table-list__body-data">
            <p>{tb.campaignName ?? "-"}</p>
          </div>

          <div className="table-list__body-data">
            <p>{tb.price ? `${tb.price}€` : "—"}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
