import React from "react";
import edit from "@/assets/icons/edit-3 (1).svg";
import insight from "@/assets/icons/bar-chart-2.svg";
import activity from "@/assets/icons/activity.svg";
import type { CampaignResponse } from "@/types/store/index.types";
import { formatCampaignDate } from "@/utils/functions/formatDate";
import { formatFollowers } from "@/utils/functions/formatFollowers";
import { getResultCPM } from "@/client-side/utils";
import {EyeHide} from "@/client-side/widgets/campaign/components/eye-hide/eye-hide.tsx";

type VisibilityState = {
  isCpmAndResultHidden: boolean;
  isPriceHidden: boolean;
};
type VisibleStats = {
  visibleAccounts: any[];
  visibleContent: any[];
  postsCount: number;
  videosCount: number;
};
interface Props {
  campaign: CampaignResponse;
  onVisibilityChange?: (nextVisibility: VisibilityState) => void;
  canToggleVisibility?: boolean;
  visibleStats?: VisibleStats;
}

const currencySymbols: Record<string, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
};

const formatCurrency = (
    value: number | string | null | undefined,
    currency: string | null | undefined,
) => {
  const symbol = currencySymbols[currency || "EUR"] || currency || "€";
  return `${value ?? 0}${symbol}`;
};

export const BarSection: React.FC<Props> = ({
                                              campaign,
                                              onVisibilityChange,
                                              canToggleVisibility = false,
                                              visibleStats
                                            }) => {
  const resultCPM = getResultCPM(campaign.cpm);

  const currency = campaign.displayCurrency ?? "EUR";

  const isPriceHidden = Boolean(campaign.isPriceHidden);

  const isCpmAndResultHidden = Boolean(campaign.isCpmAndResultHidden);

  const togglePriceVisibility = () => {

    onVisibilityChange?.({

      isPriceHidden: !isPriceHidden,

      isCpmAndResultHidden,

    });

  };

  const toggleCpmVisibility = () => {

    onVisibilityChange?.({

      isPriceHidden,

      isCpmAndResultHidden: !isCpmAndResultHidden,

    });

  };

  return (
      <div className="BarSection">
        <div className="BarSection-info block">
          <div className="BarSection-info__title">
            <img src={edit} alt="" />
            <h2>Brief</h2>
          </div>

          <div className="BarSection-info__content">
            <div className="BarSection-info__left-section">
              <p>
                Submitted:{" "}
                <span>{formatCampaignDate(campaign.creationDate)}</span>
              </p>

              <div className="BarSection-info__eye-row">
                <p>
                  Budget:{" "}
                  {isPriceHidden ? (
                      <span>••••</span>
                  ) : (
                      <span>{formatCurrency(campaign.price, currency)}</span>
                  )}
                </p>

                {canToggleVisibility && (
                    <EyeHide
                        isHidden={isPriceHidden}
                        onToggle={togglePriceVisibility}
                    />
                )}
              </div>

              <p>
                Posts: <span>{visibleStats?.postsCount ?? campaign.addedAccounts.length}</span>
              </p>
            </div>

            <div className="BarSection-info__right-section">
              <p>
                Reach:{" "}
                <span>{formatFollowers(campaign.totalFollowers)} followers</span>
              </p>

              <p>
                Videos: <span>{visibleStats?.videosCount ?? campaign.campaignContent.length}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="BarSection-info block">
          <div className="BarSection-info__title">
            <img src={insight} alt="" />
            <h2>Insights</h2>
          </div>

          <div className="BarSection-info__content">
            <div className="BarSection-info__left-section">
              <p>
                Impressions: <span>{campaign.totalImpressions ?? 0}</span>
              </p>

              <p>
                Likes: <span>{campaign.totalLikes ?? 0}</span>
              </p>

              <p>
                Saves: <span>{campaign.totalSaves ?? 0}</span>
              </p>
            </div>

            <div className="BarSection-info__right-section">
              <p>
                Comments: <span>{campaign.totalComments ?? 0}</span>
              </p>

              <p>
                Shares: <span>{campaign.totalShares ?? 0}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="BarSection-info block">
          <div className="BarSection-info__title">
            <img src={activity} alt="" />
            <h2>Performance</h2>
          </div>

          <div className="BarSection-info__content">
            <div className="BarSection-info__left-section">
              <div className="BarSection-info__eye-row">
                <p>
                  CPM:{" "}
                  {isCpmAndResultHidden ? (
                      <span>••••</span>
                  ) : (
                      <span>
                        {formatCurrency(Number(campaign.cpm ?? 0).toFixed(2), currency)}
                      </span>
                  )}
                </p>

                {canToggleVisibility && (
                    <EyeHide
                        isHidden={isCpmAndResultHidden}
                        onToggle={toggleCpmVisibility}
                    />
                )}
              </div>
              <p>
                Average Instagram CPM:{" "}
                <span>
                {formatCurrency(5, currency)} to {formatCurrency(12, currency)}
              </span>
              </p>

              <p>
                Result:{" "}
                {isCpmAndResultHidden ? (
                    <span>••••</span>
                ) : (
                    <span>{resultCPM}</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
  );
};