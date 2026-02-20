import React from "react";
import "@/client-side/styles-table/_table-campaign.scss";

import type { CampaignResponse } from "@/types/store/index.types";

import { Bar, BarSection, ToggleTables } from "@/client-side/ui";
import { useGroupPromos } from "@/client-side/hooks";
import { TableStrategy } from "../campaign-table/table-strategy";
import { TableDistributingInsight } from "../campaign-table/table-insight";

interface Props {
  campaign: CampaignResponse;
  proposalsFlag?: boolean;
  statusFlag: boolean;
}

export const CampaignTablePageShare: React.FC<Props> = ({
  campaign,
  proposalsFlag,
  statusFlag,
}) => {
  const [flag, setFlag] = React.useState<boolean>(true);

  const { mainPromos, musicPromos, otherPromos } = useGroupPromos(
    campaign.addedAccounts,
  );

  const main = React.useMemo(
    () =>
      campaign.campaignContent.filter(
        (x: any) => x.socialMediaGroup === "main",
      ),
    [campaign.campaignContent],
  );

  const music = React.useMemo(
    () =>
      campaign.campaignContent.filter(
        (x: any) => x.socialMediaGroup === "music",
      ),
    [campaign.campaignContent],
  );

  const press = React.useMemo(
    () =>
      campaign.campaignContent.filter(
        (x: any) => x.socialMediaGroup === "press",
      ),
    [campaign.campaignContent],
  );

  return (
    <div className="table-page">
      {statusFlag ? (
        <BarSection campaign={campaign} />
      ) : (
        <Bar campaign={campaign} />
      )}

      <ToggleTables onChange={() => setFlag((prev) => !prev)} flag={flag} />

      <div className="table-wrapper">
        {!flag ? (
          <>
            {" "}
            {main.length >= 1 && (
              <TableStrategy
                proposalsFlag={proposalsFlag}
                totalPrice={campaign.price}
                items={main}
                networks={mainPromos}
                group={"main"}
              />
            )}
            {music.length >= 1 && (
              <TableStrategy
                proposalsFlag={proposalsFlag}
                totalPrice={campaign.price}
                items={music}
                networks={musicPromos}
                group={"music"}
              />
            )}
            {press.length >= 1 && (
              <TableStrategy
                proposalsFlag={proposalsFlag}
                totalPrice={campaign.price}
                items={press}
                networks={otherPromos}
                group={"press"}
              />
            )}
          </>
        ) : (
          <>
            {" "}
            <TableDistributingInsight campaign={campaign} />
          </>
        )}
      </div>
    </div>
  );
};
