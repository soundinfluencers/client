import type { Campaign } from "../../../types/campaign-history.types";
import { getSocialMediaIcon } from "@/constants/social-medias.ts";
import {
  campaignNavigate
} from "@/pages/influencer/dashboard-layout/components/campaign-history-list/utils/getCampaignNavigate.tsx";
// import { STATUS_ACTIONS_MAP } from "../../../data/campaign-history.data";
// import { Link } from "react-router-dom";
// import React from "react";

import "./_table-row.scss";

interface Props {
  campaign: Campaign;
}

export const TableRow = ({ campaign }: Props) => {
  return (
    <tr className="campaign-history-table-row">
      <td className="campaign-history-table-row__name">
        <div className="campaign-history-table-row__name-content">
          <img
            src={getSocialMediaIcon(campaign.campaignSocialMedia) || ""}
            alt={campaign.campaignSocialMedia}
            className="campaign-history-table-row__name-icon"
          />
          {campaign.campaignName}
        </div>
      </td>
      <td className="campaign-history-table-row__date-post">
        {campaign.date}
      </td>
      <td className="campaign-history-table-row__reward">
        {campaign.price ? `${campaign.price}€` : "-"}
      </td>
      <td className="campaign-history-table-row__status">
        {campaign.statusLabel}
      </td>
      <td className="campaign-history-table-row__actions">
        {/*{STATUS_ACTIONS_MAP[campaign.status] || (*/}
        {/*  <span className="campaign-history-table-row__result">N/A</span>*/}
        {/*)}*/}
        {campaignNavigate(campaign)}
      </td>
    </tr>
  );
};