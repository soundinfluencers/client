import React from "react";
import "@/client-side/styles-table/_table-campaign.scss";

import { LiveViewCard } from "../live-view-card/live-view";
import { useGroupPromos } from "@/client-side/hooks";
import { Bar } from "@/client-side/ui";

import { useDraftCampaignStore, useUpdateCampaign } from "@/client-side/store";
import { TableDraft } from "../tables/table-draft";

interface Props {
  campaign: any;
  view: number;
  changeView: boolean;
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
  changeView,
  view,
}) => {
  const useDraftCampaignPrice = (campaignId: string) =>
    useDraftCampaignStore((s) => s.getCampaignPrice(campaignId));
  const draftPrice = useDraftCampaignPrice(campaign.draftId);
  const storeContent = useDraftCampaignStore(
    (s) => s.contentByCampaignId[campaign.draftId],
  );
  console.log(storeContent, "storeContent");
  const accounts = useDraftCampaignStore(
    (s) => s.accountsByCampaignId[campaign.draftId] ?? [],
  );
  const patches = useUpdateCampaign((s) => s.patches);

  const baseContent =
    storeContent && storeContent.length
      ? storeContent
      : (campaign.campaignContentDraft ?? []);

  const content = React.useMemo(
    () => applyPatches(baseContent, patches),
    [baseContent, patches],
  );

  const { mainPromos, musicPromos, otherPromos } = useGroupPromos(accounts);

  const byGroup = React.useMemo(
    () => ({
      main: content.filter((x) => x.socialMediaGroup === "main"),
      music: content.filter((x) => x.socialMediaGroup === "music"),
      press: content.filter((x) => x.socialMediaGroup === "press"),
    }),
    [content],
  );

  return (
    <div className="table-page">
      {/* <Bar campaign={campaign} /> */}

      {view === 0 ? (
        <div className="live-view-wrapper">
          {byGroup.main.map((item: any) => (
            <LiveViewCard key={item._id} item={item} networks={mainPromos} />
          ))}
          {byGroup.music.map((item: any) => (
            <LiveViewCard key={item._id} item={item} networks={musicPromos} />
          ))}
          {byGroup.press.map((item: any) => (
            <LiveViewCard key={item._id} item={item} networks={otherPromos} />
          ))}
        </div>
      ) : (
        <div className="table-wrapper">
          {byGroup.main.length >= 1 && (
            <TableDraft
              campaignId={campaign.draftId}
              totalPrice={draftPrice}
              items={byGroup.main}
              networks={mainPromos}
              group="main"
              canEdit={true}
              changeView={changeView}
            />
          )}

          {byGroup.music.length >= 1 && (
            <TableDraft
              campaignId={campaign.draftId}
              totalPrice={draftPrice}
              items={byGroup.music}
              networks={musicPromos}
              group="music"
              canEdit={true}
              changeView={changeView}
            />
          )}

          {byGroup.press.length >= 1 && (
            <TableDraft
              campaignId={campaign.draftId}
              totalPrice={draftPrice}
              items={byGroup.press}
              networks={otherPromos}
              group="press"
              canEdit={true}
              changeView={changeView}
            />
          )}
        </div>
      )}
    </div>
  );
};
