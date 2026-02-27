import React from "react";
import "@/client-side/styles-table/_table-campaign.scss";

import type { CampaignResponse } from "@/types/store/index.types";

import { Bar, BarSection, ToggleTables } from "@/client-side/ui";
import { useGroupPromos } from "@/client-side/hooks";
import { TableStrategy } from "../campaign-table/table-strategy";
import { TableDistributingInsight } from "../campaign-table/table-insight";
import { LiveViewCard } from "../live-view-card/live-view";
import { LiveViewCardInsight } from "../live-view-card/live-view-card-insight";

interface Props {
  campaign: CampaignResponse;
  proposalsFlag?: boolean;
  statusFlag: boolean;
  flag: boolean;
  view: number;
}

export const CampaignTablePageShare: React.FC<Props> = ({
  campaign,
  proposalsFlag,
  statusFlag,
  flag,
  view,
}) => {
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
              {campaign.addedAccounts.map((instightCard, i) => (
                <LiveViewCardInsight campaign={campaign} item={instightCard} />
              ))}
            </>
          )}
        </div>
      ) : (
        <div className="table-wrapper">
          {flag ? (
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
      )}
    </div>
  );
};
