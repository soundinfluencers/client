import React from "react";
import "../../../../scss-campaign-table/_table-campaign.scss";

import { BarSection } from "../../bar-section/bar-section";
import { TableStrategy } from "./table-strategy";
import type { CampaignResponse } from "@/types/store/index.types";
import { ToggleTables } from "../ui/toggleTables";
import { TableDistributingInsight } from "./table-insight";
import { Bar } from "../../bar-section/bar";
import { useGroupPromos } from "../../../../../../hooks/client/campaigns/useGroupPromos";
import { LiveViewCardInsight } from "../components/live-view-card/live-view-card-insight";
import { LiveViewCard } from "../components/live-view-card/live-view-strategy";

interface Props {
  campaign: CampaignResponse;
  proposalsFlag?: boolean;
  statusFlag: boolean;
  view: number;
}

export const CampaignTablePage: React.FC<Props> = ({
  campaign,
  proposalsFlag,
  statusFlag,
  view,
}) => {
  const [flag, setFlag] = React.useState<boolean>(true);
  console.log(campaign, "campaign");
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

      {statusFlag && (
        <ToggleTables onChange={() => setFlag((prev) => !prev)} flag={flag} />
      )}

      {view === 0 ? (
        <div className="live-view-wrapper">
          {flag ? (
            <>
              {main.length >= 1 &&
                main.map((item) => (
                  <LiveViewCard item={item} networks={mainPromos} />
                ))}
              {music.length >= 1 &&
                music.map((item) => (
                  <LiveViewCard item={item} networks={musicPromos} />
                ))}
              {press.length >= 1 &&
                press.map((item) => (
                  <LiveViewCard item={item} networks={otherPromos} />
                ))}
            </>
          ) : (
            <>
              {main.length >= 1 &&
                main.map((item) => (
                  <LiveViewCardInsight campaign={campaign} item={item} />
                ))}
              {music.length >= 1 &&
                music.map((item) => (
                  <LiveViewCardInsight campaign={campaign} item={item} />
                ))}
              {press.length >= 1 &&
                press.map((item) => (
                  <LiveViewCardInsight item={item} campaign={campaign} />
                ))}
            </>
          )}
        </div>
      ) : (
        <>
          {" "}
          {!statusFlag ? (
            <div className="table-wrapper">
              {main.length >= 1 && (
                <TableStrategy
                  proposalsFlag={proposalsFlag}
                  totalPrice={campaign.price}
                  items={main}
                  networks={mainPromos}
                />
              )}

              {music.length >= 1 && (
                <TableStrategy
                  proposalsFlag={proposalsFlag}
                  totalPrice={campaign.price}
                  items={music}
                  networks={musicPromos}
                />
              )}

              {press.length >= 1 && (
                <TableStrategy
                  proposalsFlag={proposalsFlag}
                  totalPrice={campaign.price}
                  items={press}
                  networks={otherPromos}
                />
              )}
            </div>
          ) : flag ? (
            <TableStrategy
              totalPrice={campaign.price}
              items={campaign.campaignContent}
              networks={campaign.addedAccounts}
            />
          ) : (
            <TableDistributingInsight campaign={campaign} />
          )}
        </>
      )}
    </div>
  );
};
