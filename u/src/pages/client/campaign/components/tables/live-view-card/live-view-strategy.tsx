import { getSocialMediaIcon } from "@/constants/social-medias";
import type { SocialMediaType } from "@/types/utils/constants.types";
import edit from "@/assets/icons/edit.svg";
import bookmark from "@/assets/icons/bookmark.svg";
import link from "@/assets/icons/link (1).svg";
import { formatFollowers } from "@/utils/functions/formatFollowers";
import type { CampaignAddedAccount } from "@/types/store/index.types";
import "./campaign-view-card.scss";

interface LiveViewCardProps {
  isMusic?: boolean;
  item: any;
  networks: CampaignAddedAccount[];
}

export const LiveViewCard: React.FC<LiveViewCardProps> = ({
  item,
  networks,
}) => {
  return (
    <div className="live-view-card">
      <div className="live-view-card__content">
        <div className="live-view-card__video">
          <div className="video"></div>
        </div>
        <div className="live-view-card__fill-data">
          <h3>Post description</h3>
          <div className="fill-input">
            <img src={edit} alt="" />
            <div className="descr">
              {item.descriptions?.map((dp, i) => (
                <p>
                  {i + 1} {dp.description}
                </p>
              ))}
            </div>
          </div>
        </div>

        {item.socialMediaGroup !== "music" &&
          item.socialMediaGroup !== "press" && (
            <>
              <div className="live-view-card__fill-data">
                <h3>Story Tag</h3>
                <div className="fill-input">
                  <img src={bookmark} alt="" />
                  <p>{item.taggedUser}</p>
                </div>
              </div>

              <div className="live-view-card__fill-data">
                <h3>Story Links</h3>
                <div className="fill-input">
                  <img src={link} alt="" />
                  <p>{item.taggedLink}</p>
                </div>
              </div>
            </>
          )}

        <div className="live-view-card__fill-data">
          <h3>Audience reach</h3>
          <div className="fill-input-audience">
            <div className="audience">
              <img
                src={getSocialMediaIcon(item.socialMedia as SocialMediaType)}
                alt=""
              />
              <p>{item.socialMedia}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="live-view-card__fill-data">
        <h3>Networks</h3>
        <div className="network">
          {networks.map((net) => (
            <div className="network__row">
              <div className="network__row-logo">
                {/* <img src={net.logo} alt="" /> */}
                <p>{formatFollowers(net.followers)}</p>
              </div>
              <p>{net.username}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
