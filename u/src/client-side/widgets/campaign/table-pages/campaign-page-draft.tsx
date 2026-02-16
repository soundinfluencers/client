import React from "react";
import "@/client-side/styles-table/_table-campaign.scss";

import { LiveViewCardInsight } from "../live-view-card/live-view-card-insight";
import { LiveViewCard } from "../live-view-card/live-view";
// import type { CampaignPageModel } from "@/pages/client/types";
import { useGroupPromos } from "@/client-side/hooks";
import { Bar, BarSection, ToggleTables } from "@/client-side/ui";

import { TableStrategy } from "../tables/table-strategy";
import { TableDistributingInsight } from "../tables/table-insight";
import {
  useStrategyCampaignStore,
  useUpdateCampaign,
} from "@/client-side/store";

// type RegularModel = Extract<CampaignPageModel, { kind: "regular" }>;

interface Props {
  campaign: any;
  statusFlag: boolean;
  view: number;
}
export function applyPatches<T extends { _id: string }>(
  base: T[],
  patches: Record<string, any>,
): T[] {
  if (!base?.length) return base ?? [];
  return base.map((it) => {
    const p = patches[it._id];
    return p ? ({ ...it, ...p } as T) : it;
  });
}
export const CampaignTablePageDraft: React.FC<Props> = ({
  campaign,
  statusFlag,
  view,
}) => {
  console.log(campaign, "campaign");
  const [flag, setFlag] = React.useState(true);
  // const storeContent = useStrategyCampaignStore(
  //   (s) => s.contentByCampaignId[campaign.campaignId],
  // );
  // const accounts = useStrategyCampaignStore(
  //   (s) => s.accountsByCampaignId[campaign.campaignId] ?? [],
  // );
  // const patches = useUpdateCampaign((s) => s.patches);

  // const baseContent =
  //   storeContent && storeContent.length
  //     ? storeContent
  //     : campaign.campaignContent;

  // const content = React.useMemo(
  //   () => applyPatches(baseContent, patches),
  //   [baseContent, patches],
  // );

  const { mainPromos, musicPromos, otherPromos } = useGroupPromos(
    campaign.addedAccountsDraft,
  );

  console.log(campaign.campaignContentDraft, "content");
  const content = campaign.campaignContentDraft;
  const byGroup = React.useMemo(
    () => ({
      main: content.filter((x) => x.socialMediaGroup === "main"),
      music: content.filter((x) => x.socialMediaGroup === "music"),
      press: content.filter((x) => x.socialMediaGroup === "press"),
    }),
    [content],
  );

  console.log(byGroup, "byGroup");

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
          {byGroup.main.length >= 1 &&
            byGroup.main.map((item) => (
              <LiveViewCard item={item} networks={mainPromos} />
            ))}

          {byGroup.music.length >= 1 &&
            byGroup.music.map((item) => (
              <LiveViewCard item={item} networks={musicPromos} />
            ))}

          {byGroup.press.length >= 1 &&
            byGroup.press.map((item) => (
              <LiveViewCard item={item} networks={otherPromos} />
            ))}
        </div>
      ) : (
        <div className="table-wrapper">
          {byGroup.main.length >= 1 && (
            <TableStrategy
              campaignId={campaign.campaignId}
              totalPrice={campaign.price}
              items={byGroup.main}
              networks={mainPromos}
              group="main"
              canEdit={campaign.canEdit}
            />
          )}

          {byGroup.music.length >= 1 && (
            <TableStrategy
              campaignId={campaign.campaignId}
              canEdit={campaign.canEdit}
              totalPrice={campaign.price}
              items={byGroup.music}
              networks={musicPromos}
              group="music"
            />
          )}

          {byGroup.press.length >= 1 && (
            <TableStrategy
              campaignId={campaign.campaignId}
              canEdit={campaign.canEdit}
              totalPrice={campaign.price}
              items={byGroup.press}
              networks={otherPromos}
              group="press"
            />
          )}
        </div>
      )}
    </div>
  );
};
