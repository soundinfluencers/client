import React from "react";
import "../../../../scss-campaign-table/_table-campaign.scss";

import { BarSection } from "../../bar-section/bar-section";
import { TableStrategy } from "./table-strategy";
import type { CampaignResponse } from "@/types/store/index.types";

import { Bar } from "../../bar-section/bar";

interface Props {
  campaign: CampaignResponse;

  statusFlag: boolean;
}

export const CampaignTablePage: React.FC<Props> = ({
  campaign,

  statusFlag,
}) => {
  console.log(statusFlag);
  return (
    <div className="table-page">
      {statusFlag ? (
        <BarSection campaign={campaign} />
      ) : (
        <Bar campaign={campaign} />
      )}

      <TableStrategy
        totalPrice={campaign.price}
        items={campaign.campaignContent}
        networks={campaign.addedAccounts}
      />
    </div>
  );
};
