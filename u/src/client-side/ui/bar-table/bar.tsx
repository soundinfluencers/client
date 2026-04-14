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
import {calcGroupPrices} from "@/client-side/utils";

type AnyCampaign = any;

const sumFollowers = (arr: any[] = []) =>
  arr.reduce((sum, n) => sum + Number(n?.followers ?? 0), 0);

const isNonEmpty = (v: any) => Array.isArray(v) && v.length > 0;

function pickAccountsFromCampaign(c: AnyCampaign): any[] | undefined {
  if (!c) return undefined;

  if (c.kind === "proposal") return c.selectedOption?.addedAccounts;
  if (c.kind === "draft") return c.addedAccounts;

  return c.addedAccounts;
}

function pickContentFromCampaign(c: AnyCampaign): any[] | undefined {
  if (!c) return undefined;

  if (c.kind === "proposal") return c.selectedOption?.campaignContent;
  if (c.kind === "draft") return c.campaignContent;

  return c.campaignContent;
}

export const Bar = ({ campaign }: { campaign: AnyCampaign }) => {
  const store = useCampaignStore();
  const useDraftCampaignPrice = (campaignId: string) =>
    useDraftCampaignStore((s) => s.getCampaignPrice(campaignId));
  const draftPrice = useDraftCampaignPrice(campaign?.draftId);
  // const accounts = React.useMemo(() => {
  //   const fromCampaign = pickAccountsFromCampaign(campaign);
  //   if (isNonEmpty(fromCampaign)) return fromCampaign as any[];
  //
  //   return (store.promoCard ?? []) as any[];
  // }, [campaign, store.promoCard]);
  const accounts = React.useMemo(() => {
    return getCampaignSelectedAccounts(store);
  }, [campaign, store.offer, store.promoCard]);

  const { totalPublicPrice } = React.useMemo(
      () => calcGroupPrices(accounts),
      [accounts],
  );
  const content = React.useMemo(() => {
    const fromCampaign = pickContentFromCampaign(campaign);
    if (isNonEmpty(fromCampaign)) return fromCampaign as any[];

    return (store.campaignContent ?? []) as any[];
  }, [campaign, store.campaignContent]);

  const budget =
    campaign?.price ?? campaign?.totalPrice ?? store.totalPrice ?? 0;

  const submitted = formatCampaignDate(
    String(campaign?.submittedAt ?? campaign?.createdAt ?? new Date()),
  );

  const reachFollowers = React.useMemo(
    () => sumFollowers(accounts),
    [accounts],
  );

  const postsCount = accounts.length;

  const barUIs = [
    { name: `Submitted: ${submitted}`, img: calendar, row: true },
    { name: `Budget: ${totalPublicPrice || budget || draftPrice}€`, img: creditcard, row: true },
    {
      name: `Reach: ${formatFollowers(reachFollowers)} followers`,
      img: usercheck,
      row: true,
    },
    { name: `Posts: ${postsCount}`, img: edit, row: true },
    { name: `Video: ${content.length}`, img: video, row: false },
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
