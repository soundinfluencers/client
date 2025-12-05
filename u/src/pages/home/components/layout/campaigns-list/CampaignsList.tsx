import type { FC } from "react";
import type { ListDisplayMode } from "../../../../../types/utils/constants.types.ts";
import type { CampaignForList } from "../../../../../types/campaign.types.ts";
import { getSocialMediaIcon } from "../../../../../constants/social-medias.ts";
import "./_campaigns_list.scss";

export interface CampaignsListProps {
  listDisplayMode: ListDisplayMode;
  list: CampaignForList[];
}

export const CampaignsList: FC<CampaignsListProps> = ({
  listDisplayMode,
  list,
}: CampaignsListProps) => {
  if (list?.length === 0) return <div>Empty list</div>;

  return listDisplayMode === "list" ? (
    <table className="home-campaigns-table">
      <thead className="home-campaigns-table__header">
        <tr className="home-campaigns-table__row">
          <th className="home-campaigns-table__cell">Status</th>
          <th className="home-campaigns-table__cell">Date post</th>
          <th className="home-campaigns-table__cell">Name</th>
          <th className="home-campaigns-table__cell">Price</th>
        </tr>
      </thead>

      <tbody className="home-campaigns-table__body">
        {list.map((item) => (
          <tr key={item._id} className="home-campaigns-table__row">
            <td className="home-campaigns-table__cell">
              <div className="home-campaigns-table__status">
                <img
                  className="home-campaigns-table__icon"
                  src={getSocialMediaIcon(item.socialMedia)}
                  alt=""
                />
                <p>{item.status}</p>
              </div>
            </td>

            <td className="home-campaigns-table__cell home-campaigns-table__date">
              {item.creationDate}
            </td>
            <td className="home-campaigns-table__cell home-campaigns-table__name">
              {item.campaignName}
            </td>
            <td className="home-campaigns-table__cell home-campaigns-table__price">
              {item.price}€
            </td>
          </tr>
        ))}
      </tbody>
    </table>
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
