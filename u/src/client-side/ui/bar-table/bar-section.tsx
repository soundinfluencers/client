import React from "react";
import edit from "@/assets/icons/edit.svg";
import insight from "@/assets/icons/bar-chart-2.svg";
import activity from "@/assets/icons/activity.svg";
import type { CampaignResponse } from "@/types/store/index.types";
import { formatCampaignDate } from "@/utils/functions/formatDate";

import { formatFollowers } from "@/utils/functions/formatFollowers";
import { getCPM, getResultCPM } from "@/client-side/utils";

interface Props {
  campaign: CampaignResponse;
}
export const BarSection: React.FC<Props> = ({ campaign }) => {
  const cpm = getCPM(campaign.cpm);
  const resultCPM = getResultCPM(cpm);
  return (
    <div className="BarSection">
      <div className="BarSection-info block">
        <div className="BarSection-info__title">
          <img src={edit} alt="" />
          <h2>Brief</h2>
        </div>
        <div className="BarSection-info__content">
          <div className="BarSection-info__left-section">
            <p>
              Submitted:{" "}
              <span>{formatCampaignDate(campaign.creationDate)}</span>
            </p>{" "}
            <p>
              Budget: <span>{campaign.price}</span>
            </p>{" "}
            <p>
              Posts: <span>{campaign.addedAccounts.length}</span>
            </p>
          </div>
          <div className="BarSection-info__right-section">
            {" "}
            <p>
              Reach:{" "}
              <span>{formatFollowers(campaign.totalFollowers)} followers</span>
            </p>
            <p>
              Videos: <span>{campaign.campaignContent.length}</span>
            </p>
          </div>
        </div>
      </div>{" "}
      <div className="BarSection-info block">
        <div className="BarSection-info__title">
          <img src={insight} alt="" />
          <h2>Insights</h2>
        </div>
        <div className="BarSection-info__content">
          <div className="BarSection-info__left-section">
            <p>
              Impressions: <span>{campaign.totalImpressions ?? 0}</span>
            </p>{" "}
            <p>
              Likes: <span>{campaign.totalLikes ?? 0}</span>
            </p>{" "}
            <p>
              Saves: <span>{campaign.totalSaves ?? 0}</span>
            </p>
          </div>
          <div className="BarSection-info__right-section">
            {" "}
            <p>
              Comments: <span>{campaign.totalComments ?? 0}</span>
            </p>
            <p>
              Shares: <span>{campaign.totalShares ?? 0}</span>
            </p>
          </div>
        </div>
      </div>
      <div className="BarSection-info block">
        <div className="BarSection-info__title">
          <img src={activity} alt="" />
          <h2>Performance</h2>
        </div>
        <div className="BarSection-info__content">
          <div className="BarSection-info__left-section">
            <p>
              CPM: <span>{cpm}</span>
            </p>{" "}
            <p>
              Average Instagram CPM: <span>5€ to 12€</span>
            </p>{" "}
            <p>
              Result: <span>{resultCPM}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
