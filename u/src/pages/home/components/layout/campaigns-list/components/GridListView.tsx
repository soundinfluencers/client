import { getSocialMediaIcon } from "@/constants/social-medias";
import type { CampaignForList } from "@/pages/client/types/dashboard/campaign.types";
import trash from "@/assets/icons/trash-2.svg";
interface GridListViewProps {
  list: CampaignForList[];
}

export const GridListView: React.FC<GridListViewProps> = ({ list }) => {
  return (
    <div className="home-campaigns-grid">
      {list.map((item) => (
        <div key={item._id} className="home-campaigns-grid__item">
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
            {item.status === "Draft" && <img src={trash} alt="" />}
          </div>
        </div>
      ))}
    </div>
  );
};
