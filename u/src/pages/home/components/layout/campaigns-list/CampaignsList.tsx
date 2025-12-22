import type { FC } from "react";
import type { ListDisplayMode } from "../../../../../types/utils/constants.types.ts";
import type { CampaignForList } from "../../../../../types/campaign.types.ts";
import { getSocialMediaIcon } from "../../../../../constants/social-medias.ts";
import "./_campaigns_list.scss";
import { Table } from "../../../../../components/ui/table/table.tsx";

export interface CampaignsListProps {
  listDisplayMode: number;
  list: CampaignForList[];
}

export const CampaignsList: FC<CampaignsListProps> = ({
  listDisplayMode,
  list,
}: CampaignsListProps) => {
  if (list?.length === 0) return <div>Empty list</div>;
  const thead = ["Status", "Date post", "Name", "Price"];
  return listDisplayMode === 0 ? (
    <div className="table-list">
      <div className="table-list__header">
        {thead.map((th, i) => (
          <div key={i} className="table-list__header-data">
            <p>{th}</p>
          </div>
        ))}
      </div>{" "}
      {list.map((tb) => (
        <div key={tb._id} className={`table-list__body-row `}>
          <div className="table-list__body-data">
            {" "}
            <div className="socialMedia">
              <img
                className="home-campaigns-table__icon"
                src={getSocialMediaIcon(tb.socialMedia)}
                alt=""
              />
              <p>{tb.status}</p>
            </div>
          </div>
          <div style={{ width: "250px" }} className="table-list__body-data">
            <p>{tb.creationDate}</p>
          </div>
          <div className="table-list__body-data">
            <p>{tb.campaignName}</p>
          </div>
          <div className="table-list__body-data">
            <p>{tb.price}€</p>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="home-campaigns-grid">
      {list.map((item: CampaignForList) => (
        <div key={item._id} className="home-campaigns-grid__item">
          <div className="home-campaigns-grid__item-header">
            <div className="home-campaigns-grid__item-info">
              <div className="home-campaigns-grid__item-meta">
                <img src={getSocialMediaIcon(item.socialMedia)} alt="" />
                <p>{item.status}</p>
              </div>

              <div className="home-campaigns-grid__item-date">
                <p>{item.creationDate}</p>
              </div>
            </div>

            <div className="home-campaigns-grid__item-price">
              <p>{item.price}€</p>
            </div>
          </div>

          <div className="home-campaigns-grid__item-title">
            <p>{item.campaignName}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
