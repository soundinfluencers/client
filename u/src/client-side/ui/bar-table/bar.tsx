import React from "react";
import edit from "@/assets/bar-campaign-strategy/edit-3.svg";
import creditcard from "@/assets/bar-campaign-strategy/credit-card.svg";
import calendar from "@/assets/bar-campaign-strategy/calendar.svg";
import video from "@/assets/bar-campaign-strategy/video.svg";
import usercheck from "@/assets/bar-campaign-strategy/user-check.svg";
import "../styles/table-components.scss";

import { formatCampaignDate } from "@/utils/functions/formatDate";
import { formatFollowers } from "@/utils/functions/formatFollowers";
import { useCampaignStore, useDraftCampaignStore } from "@/client-side/store";
import {getCampaignSelectedAccounts} from "@/client-side/pages/campaign-strategy/model/campaign-strategy.helpers.ts";
import {formatCurrency} from "@/shared/functions/formatCurrency.ts";
import { formatSavedShareTotal, formatShareSubmitted } from "@/client-side/pages/campaign-share/model/share-campaign-read";

type AnyCampaign = any;
type VisibleStats = {
  visibleAccounts: any[];
  visibleContent: any[];
  postsCount: number;
  videosCount: number;
};
const sumFollowers = (arr: any[] = []) =>
  arr.reduce((sum, n) => sum + Number(n?.followers ?? 0), 0);

const isNonEmpty = (v: any) => Array.isArray(v) && v.length > 0;

function pickContentFromCampaign(c: AnyCampaign): any[] | undefined {
  if (!c) return undefined;

  if (c.kind === "proposal") return c.selectedOption?.campaignContent;
  if (c.kind === "draft") return c.campaignContent;

  return c.campaignContent;
}

export const Bar = ({ campaign,visibleStats, readOnlyShare = false }: { campaign: AnyCampaign,visibleStats?:VisibleStats; readOnlyShare?: boolean }) => {
  const store = useCampaignStore();
  const useDraftCampaignPrice = (campaignId: string) =>
    useDraftCampaignStore((s) => readOnlyShare ? 0 : s.getCampaignPrice(campaignId));
  const draftPrice = useDraftCampaignPrice(campaign?.draftId);
  // const accounts = React.useMemo(() => {
  //   const fromCampaign = pickAccountsFromCampaign(campaign);
  //   if (isNonEmpty(fromCampaign)) return fromCampaign as any[];
  //
  //   return (store.promoCard ?? []) as any[];
  // }, [campaign, store.promoCard]);
  const accounts = React.useMemo(() => {
    if (readOnlyShare) return campaign?.selectedOption?.addedAccounts ?? campaign?.addedAccounts ?? [];
    return getCampaignSelectedAccounts(campaign, store);
  }, [campaign, store.offer, store.promoCard, readOnlyShare]);
  console.log(campaign,'aqwe')
  const content = React.useMemo(() => {
    const fromCampaign = pickContentFromCampaign(campaign);
    if (readOnlyShare) return fromCampaign ?? [];
    if (isNonEmpty(fromCampaign)) return fromCampaign as any[];

    return (store.campaignContent ?? []) as any[];
  }, [campaign, store.campaignContent, readOnlyShare]);

  const budget =
    campaign?.price;

  const submitted = readOnlyShare ? formatShareSubmitted(campaign) : formatCampaignDate(
    String(campaign?.submittedAt ?? campaign?.createdAt ?? new Date()),
  );

  console.log(accounts, 'awdjawnlwnadjnwajawdnawdjjawjwad');
  const postsCount = visibleStats?.postsCount ?? accounts.length;
  const totalFollowers =
      Number(campaign?.totalFollowers ?? 0) > 0
          ? Number(campaign.totalFollowers)
          : sumFollowers(accounts);

  const currency = campaign?.displayCurrency ?? "EUR";

  const barUIs = [
    { name: `Status: ${campaign?.status || ""}`, img: calendar, row: true },
    { name: `Submitted: ${submitted}`, img: calendar, row: true },
    {
      name: `Budget: ${
          campaign.isPriceHidden
              ? ""
              : (readOnlyShare || campaign?.kind === "proposal") ? formatSavedShareTotal(campaign) : formatCurrency(budget || draftPrice, currency)
      }`,
      img: creditcard,
      row: true,
    },
    {
      name: `Reach: ${formatFollowers(totalFollowers)} followers`,
      img: usercheck,
      row: true,
    },
    { name: `Posts: ${postsCount || content.length}`, img: edit, row: true },
    {
      name: `Video: ${visibleStats?.videosCount ?? content.length}`,
      img: video,
      row: false,
    },
  ];

  return (
    <div className="bar-strategy-proposals">
      {barUIs.map((item, i) => (
        <div key={i} className="UI-button">
          <p>{item.name}</p>
          {item.row && <div className="row" />}
        </div>
      ))}
    </div>
  );
};
