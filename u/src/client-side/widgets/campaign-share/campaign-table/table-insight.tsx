import React from "react";
import "@/client-side/styles-table/table-base.scss";

import type { CampaignResponse } from "@/types/store/index.types";
import { TableCard } from "../card-table/table-card-insight";

import chevron from "@/assets/icons/chevron-up.svg";
import { columns, titles } from "@/client-side/data/table-campaign.data";
import { getCurrencySymbol } from "@/pages/influencer/negotiation/utils/getCurrencySymbol.ts";

interface Props {
  campaign: CampaignResponse | any;
}

const COL_WIDTH: Partial<Record<string, number>> = {
  network: 205,
  followers: 96,
  genres: 300,
  countries: 300,
  content: 130,
  description: 190,
  date: 113,
  tag: 113,
  link: 113,
  brief: 150,
  tracklink: 200,
  tracktitle: 200,
};

type SortDir = "asc" | "desc" | null;

type SortKey =
    | "followers"
    | "impressions"
    | "likes"
    | "comments"
    | "saves"
    | "shares";

type SortState = {
  key: SortKey | null;
  dir: SortDir;
};

const SORTABLE_KEYS: SortKey[] = [
  "followers",
  "impressions",
  "likes",
  "comments",
  "saves",
  "shares",
];

const toNumber = (v: unknown) => {
  if (v === null || v === undefined) return 0;

  if (typeof v === "number") {
    return Number.isFinite(v) ? v : 0;
  }

  if (typeof v === "string") {
    const cleaned = v.replace(/\s/g, "").replace(/,/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  }

  return 0;
};

const getCampaignAccounts = (campaign: any) => {
  return campaign?.selectedOption?.addedAccounts ?? campaign?.addedAccounts ?? [];
};

const getCampaignPrice = (campaign: any, accounts: any[]) => {
  const directPrice = Number(
      campaign?.selectedOption?.price ??
      campaign?.selectedOption?.campaignPrice ??
      campaign?.price ??
      campaign?.campaignPrice ??
      0,
  );

  if (Number.isFinite(directPrice) && directPrice > 0) {
    return directPrice;
  }

  return accounts.reduce((sum, account) => {
    return sum + Number(account?.publicPrice ?? account?.price ?? 0);
  }, 0);
};

const getTotals = (campaign: any, accounts: any[]) => {
  return {
    followers:
        Number(campaign?.totalFollowers ?? 0) ||
        accounts.reduce((sum, account) => sum + toNumber(account?.followers), 0),

    impressions:
        Number(campaign?.totalImpressions ?? 0) ||
        accounts.reduce((sum, account) => sum + toNumber(account?.impressions), 0),

    likes:
        Number(campaign?.totalLikes ?? 0) ||
        accounts.reduce((sum, account) => sum + toNumber(account?.like ?? account?.likes), 0),

    comments:
        Number(campaign?.totalComments ?? 0) ||
        accounts.reduce((sum, account) => sum + toNumber(account?.comments), 0),

    saves:
        Number(campaign?.totalSaves ?? 0) ||
        accounts.reduce((sum, account) => sum + toNumber(account?.saves), 0),

    shares:
        Number(campaign?.totalShares ?? 0) ||
        accounts.reduce((sum, account) => sum + toNumber(account?.shares), 0),
  };
};

export const TableDistributingInsight: React.FC<Props> = ({ campaign }) => {
  const [sort, setSort] = React.useState<SortState>({
    key: null,
    dir: null,
  });

  const accounts = React.useMemo(
      () => getCampaignAccounts(campaign),
      [campaign],
  );

  const totals = React.useMemo(
      () => getTotals(campaign, accounts),
      [campaign, accounts],
  );

  const price = React.useMemo(
      () => getCampaignPrice(campaign, accounts),
      [campaign, accounts],
  );

  const setSortFor = (key: SortKey, dir: Exclude<SortDir, null>) => {
    setSort((prev) => {
      if (prev.key === key && prev.dir === dir) {
        return {
          key: null,
          dir: null,
        };
      }

      return {
        key,
        dir,
      };
    });
  };

  const sortedAccounts = React.useMemo(() => {
    const arr = [...accounts];

    if (!sort.key || !sort.dir) return arr;

    arr.sort((a, b) => {
      const field = sort.key === "likes" ? "like" : sort.key;

      const av = toNumber((a as any)?.[field]);
      const bv = toNumber((b as any)?.[field]);

      return sort.dir === "asc" ? av - bv : bv - av;
    });

    return arr;
  }, [accounts, sort.key, sort.dir]);

  return (
      <div className="tableBase-wrap">
        <table className="tableBase border-table tableBase--campaign table-campaign-page">
          <colgroup>
            {columns.map((key) => (
                <col
                    key={key}
                    style={
                      COL_WIDTH[key]
                          ? {
                            width: `${COL_WIDTH[key]}px`,
                          }
                          : undefined
                    }
                />
            ))}
          </colgroup>

          <thead>
          <tr>
            {columns.map((key) => {
              const isSortable = SORTABLE_KEYS.includes(key as SortKey);
              const activeDesc = sort.key === key && sort.dir === "desc";
              const activeAsc = sort.key === key && sort.dir === "asc";

              return (
                  <th key={key} className="table-campaign-page__th">
                    <div className="header-content">
                      <span className="th-title">{titles[key]}</span>

                      {isSortable && (
                          <div className="switch" aria-label={`Sort by ${key}`}>
                            <button
                                type="button"
                                className={`switch-btn ${activeDesc ? "active" : ""}`}
                                onClick={() => setSortFor(key as SortKey, "desc")}
                                aria-pressed={activeDesc}
                                title="Sort desc"
                            >
                              <img className="up" src={chevron} alt="" />
                            </button>

                            <button
                                type="button"
                                className={`switch-btn ${activeAsc ? "active" : ""}`}
                                onClick={() => setSortFor(key as SortKey, "asc")}
                                aria-pressed={activeAsc}
                                title="Sort asc"
                            >
                              <img className="down" src={chevron} alt="" />
                            </button>
                          </div>
                      )}
                    </div>
                  </th>
              );
            })}
          </tr>
          </thead>

          <tbody>
          {sortedAccounts.map((row, index) => (
              <TableCard
                  key={
                      row.addedAccountsId ??
                      row.socialAccountId ??
                      row.accountId ??
                      row._id ??
                      `${row.influencerId}-${index}`
                  }
                  data={row}
              />
          ))}
          </tbody>

          <tfoot>
          <tr className="insight-footer-row">
            {columns.map((row, index) => (
                <td
                    key={row}
                    className={`td--footer insight-footer-cell ${
                        index === 0 || index === 1 ? "is-left-another" : ""
                    } ${index === 2 || index === 3 ? "is-empty" : ""} ${
                        index === 3 ? "is-empty-border-right" : ""
                    }`}
                >
                  {index === 0 && (
                      <p>
                        price:{" "}
                        {campaign?.isPriceHidden
                            ? "—"
                            : `${price}${getCurrencySymbol(campaign?.displayCurrency)}`}
                      </p>
                  )}

                  {index === 1 && <p>{totals.followers}</p>}
                  {index === 4 && <p>{totals.impressions}</p>}
                  {index === 5 && <p>{totals.likes}</p>}
                  {index === 6 && <p>{totals.comments}</p>}
                  {index === 7 && <p>{totals.saves}</p>}
                  {index === 8 && <p>{totals.shares}</p>}
                </td>
            ))}
          </tr>
          </tfoot>
        </table>
      </div>
  );
};