import React from "react";
import "@/client-side/styles-table/_table-campaign.scss";

import type { CampaignResponse } from "@/types/store/index.types";

import { useGroupPromos } from "@/client-side/hooks";
import { TableStrategy } from "../campaign-table/table-strategy";
import { TableDistributingInsight } from "../campaign-table/table-insight";
import { LiveViewCard } from "../live-view-card/live-view";
import { LiveViewCardInsight } from "../live-view-card/live-view-card-insight";

import {
  buildLiveViewGroups,
  getNetworksForContentItem,
} from "../model/live-view-content.helpers";

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

  const { byGroup, visibleByGroup, accountsByContentId } = React.useMemo(
      () =>
          buildLiveViewGroups({
            content: campaign.campaignContent ?? [],
            accounts: campaign.addedAccounts ?? [],
          }),
      [campaign.campaignContent, campaign.addedAccounts],
  );

  const getItemNetworks = React.useCallback(
      (item: any) => getNetworksForContentItem(item, accountsByContentId),
      [accountsByContentId],
  );

  return (
      <div className="table-page">
        {view === 0 ? (
            <div className="live-view-wrapper">
              {flag ? (
                  <>
                    {visibleByGroup.main.map((item) => (
                        <LiveViewCard
                            key={item._id}
                            item={item}
                            networks={getItemNetworks(item)}
                        />
                    ))}

                    {visibleByGroup.music.map((item) => (
                        <LiveViewCard
                            key={item._id}
                            item={item}
                            networks={getItemNetworks(item)}
                        />
                    ))}

                    {visibleByGroup.press.map((item) => (
                        <LiveViewCard
                            key={item._id}
                            item={item}
                            networks={getItemNetworks(item)}
                        />
                    ))}
                  </>
              ) : (
                  <>
                    {campaign.addedAccounts.map((instightCard, i) => (
                        <LiveViewCardInsight
                            key={
                                instightCard?.addedAccountsId ??
                                instightCard?.socialAccountId ??
                                instightCard?.accountId ??
                                i
                            }
                            campaign={campaign}
                            item={instightCard}
                        />
                    ))}
                  </>
              )}
            </div>
        ) : (
            <div className="table-wrapper">
              {flag ? (
                  <>
                    {byGroup.main.length >= 1 && (
                        <TableStrategy
                            proposalsFlag={proposalsFlag}
                            totalPrice={
                              campaign.isPriceHidden ? null : campaign.price
                            }
                            items={byGroup.main}
                            networks={mainPromos}
                            title="Video Distribution"
                            group="main"
                            campaign={campaign}
                        />
                    )}

                    {byGroup.music.length >= 1 && (
                        <TableStrategy
                            proposalsFlag={proposalsFlag}
                            totalPrice={
                              campaign.isPriceHidden ? null : campaign.price
                            }
                            items={byGroup.music}
                            networks={musicPromos}
                            title="Music Placements"
                            group="music"
                            campaign={campaign}
                        />
                    )}

                    {byGroup.press.length >= 1 && (
                        <TableStrategy
                            proposalsFlag={proposalsFlag}
                            totalPrice={
                              campaign.isPriceHidden ? null : campaign.price
                            }
                            items={byGroup.press}
                            networks={otherPromos}
                            group="press"
                            title="Press Coverage"
                            campaign={campaign}
                        />
                    )}
                  </>
              ) : (
                  <TableDistributingInsight campaign={campaign} />
              )}
            </div>
        )}
      </div>
  );
};