import { getSocialMediaIcon } from "@/constants/social-medias";
import type { SocialMediaType } from "@/types/utils/constants.types";
import comment from "@/assets/icons/mage_message-dots-round.svg";
import heart from "@/assets/icons/mdi_heart.svg";
import bookmark from "@/assets/icons/iconoir_bookmark.svg";
import share from "@/assets/icons/share.svg";
import link from "@/assets/icons/link (1).svg";
import chat from "@/assets/icons/bar-chart.svg";

import type { CampaignResponse } from "@/types/store/index.types";
import "./campaign-view-card.scss";

interface LiveViewCardProps {
  isMusic?: boolean;
  item: any;
  campaign: CampaignResponse;
}

export const LiveViewCardInsight: React.FC<LiveViewCardProps> = ({
  item,
  campaign,
}) => {
  return (
    <div className="live-view-cardInsight">
      <div className="live-view-cardInsight__video">
        <div className="video"></div>
      </div>
      <div
        onClick={(e) => {
          e.stopPropagation();

          window.open(
            item.taggedLink as string,
            "_blank",
            "noopener,noreferrer",
          );
        }}
        className="live-view-cardInsight__fill-data">
        <img
          src={getSocialMediaIcon(item.socialMedia as SocialMediaType)}
          alt=""
        />{" "}
        <div className="fill-input">
          <img src={link} alt="" />
          <p>{item.taggedLink}</p>
        </div>
      </div>
      <div className="live-view-cardInsight__fill-data">
        <div className="fill-input">
          <img src={comment} alt="" />
          <p>{campaign.totalComments}</p>
        </div>
      </div>{" "}
      <div className="live-view-cardInsight__fill-data">
        <div className="fill-input">
          <img src={heart} alt="" />
          <p>{campaign.totalLikes}</p>
        </div>
      </div>
      <div className="live-view-cardInsight__fill-data">
        <div className="fill-input">
          <img src={bookmark} alt="" />
          <p>{campaign.totalSaves}</p>
        </div>
      </div>
      <div className="live-view-cardInsight__fill-data">
        <div className="fill-input">
          <img src={share} alt="" />
          <p>{campaign.totalSaves}</p>
        </div>
      </div>
      <div className="live-view-cardInsight__fill-data">
        <div className="fill-input">
          <img src={chat} alt="" />
          <p>{campaign.totalImpressions}</p>
        </div>
      </div>
    </div>
  );
};
