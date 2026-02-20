import { getSocialMediaIcon } from "@/constants/social-medias";
import type { SocialMediaType } from "@/types/utils/constants.types";
import comment from "@/assets/icons/mage_message-dots-round.svg";
import heart from "@/assets/icons/mdi_heart.svg";
import bookmark from "@/assets/icons/iconoir_bookmark.svg";
import share from "@/assets/icons/share.svg";
import link from "@/assets/icons/link (1).svg";
import chat from "@/assets/icons/bar-chart.svg";
import preview from "@/assets/icons/video (1).png";

import type { CampaignResponse } from "@/types/store/index.types";
import "@/client-side/styles-table/campaign-view-card.scss";
import { PreviewPhoto } from "./preview/preview-component";
import React from "react";
import { ModalVideo } from "@/shared/ui/modal-video/ModalVideo";
import { VideoPreview } from "./preview/preview-video-component";

interface LiveViewCardProps {
  isMusic?: boolean;
  item: any;
  campaign: CampaignResponse;
}

export const LiveViewCardInsight: React.FC<LiveViewCardProps> = ({
  item,
  campaign,
}) => {
  const [isVideoOpen, setIsVideoOpen] = React.useState(false);

  const media0 = item?.mediaCache?.items?.[0];
  const pathLower = media0?.pathLower;
  const videoUrl = media0?.url ?? null;

  const hasVideo = Boolean(pathLower);
  return (
    <div className="live-view-cardInsight">
      <div className="live-view-cardInsight__video">
        <div
          role={hasVideo ? "button" : undefined}
          style={{ cursor: hasVideo ? "pointer" : "default" }}
          onClick={() => {
            if (!hasVideo) return;
            setIsVideoOpen(true);
          }}>
          <PreviewPhoto
            previewUrl={media0?.previewUrl}
            pathLower={media0?.pathLower}
            fileId={media0?.fileId}
          />
        </div>
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
          <p>{item.taggedLink ?? "no tagged link"}</p>
        </div>
      </div>
      <div className="live-view-cardInsight__fill-data">
        <div className="fill-input">
          <img src={comment} alt="" />
          <p>{campaign.totalComments ?? 0}</p>
        </div>
      </div>{" "}
      <div className="live-view-cardInsight__fill-data">
        <div className="fill-input">
          <img src={heart} alt="" />
          <p>{campaign.totalLikes ?? 0}</p>
        </div>
      </div>
      <div className="live-view-cardInsight__fill-data">
        <div className="fill-input">
          <img src={bookmark} alt="" />
          <p>{campaign.totalSaves ?? 0}</p>
        </div>
      </div>
      <div className="live-view-cardInsight__fill-data">
        <div className="fill-input">
          <img src={share} alt="" />
          <p>{campaign.totalSaves ?? 0}</p>
        </div>
      </div>
      <div className="live-view-cardInsight__fill-data">
        <div className="fill-input">
          <img src={chat} alt="" />
          <p>{campaign.totalImpressions ?? 0}</p>
        </div>
      </div>
      {isVideoOpen && (
        <ModalVideo
          className="modal-block"
          onClose={() => setIsVideoOpen(false)}>
          <VideoPreview videoUrl={videoUrl} pathLower={pathLower} />
          {/* <div className="name-video">name video</div> */}
        </ModalVideo>
      )}
    </div>
  );
};
