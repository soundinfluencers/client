import React from "react";
import "@/client-side/styles-table/table-base.scss";

import type { CampaignResponse } from "@/types/store/index.types";
import { TableCard } from "../card-table/table-card-insight";

import chevron from "@/assets/icons/chevron-up.svg";
import { columns, titles } from "@/client-side/data/table-campaign.data";

interface Props {
  campaign: CampaignResponse;
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
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const cleaned = v.replace(/\s/g, "").replace(/,/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

export const TableDistributingInsight: React.FC<Props> = ({ campaign }) => {
  const [sort, setSort] = React.useState<SortState>({ key: null, dir: null });

  const setSortFor = (key: SortKey, dir: Exclude<SortDir, null>) => {
    setSort((prev) => {
      if (prev.key === key && prev.dir === dir) return { key: null, dir: null };

      return { key, dir };
    });
  };

  const sortedAccounts = React.useMemo(() => {
    const arr = [...campaign.addedAccounts];

    if (!sort.key || !sort.dir) return arr;

    arr.sort((a, b) => {
      const field = sort.key === "likes" ? "like" : sort.key;

      const av = toNumber((a as any)[field || 0]);
      const bv = toNumber((b as any)[field || 0]);

      return sort.dir === "asc" ? av - bv : bv - av;
    });

    return arr;
  }, [campaign.addedAccounts, sort.key, sort.dir]);

  return (
    <div className="tableBase-wrap">
      <table className="tableBase tableBase--campaign table-campaign-page">
        <colgroup>
          {columns.map((key) => (
            <col
              key={key}
              style={
                COL_WIDTH[key] ? { width: `${COL_WIDTH[key]}px` } : undefined
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
                          title="Sort desc">
                          <img className="up" src={chevron} alt="" />
                        </button>

                        <button
                          type="button"
                          className={`switch-btn ${activeAsc ? "active" : ""}`}
                          onClick={() => setSortFor(key as SortKey, "asc")}
                          aria-pressed={activeAsc}
                          title="Sort asc">
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
              key={row.accountId ?? row._id ?? `${row.influencerId}-${index}`}
              data={row}
            />
          ))}
        </tbody>

        <tfoot>
          <tr>
            {columns.map((_, index) => (
              <td
                key={index}
                className={`td--footer ${index === 0 || index === 1 ? "is-left" : ""}`}>
                {index === 0 && <p>price: {campaign.price}€</p>}
                {index === 1 && <p>{campaign.totalFollowers}</p>}

                {index === 4 && <p>{campaign.totalImpressions}</p>}
                {index === 5 && <p>{campaign.totalLikes}</p>}
                {index === 6 && <p>{campaign.totalComments}</p>}
                {index === 7 && <p>{campaign.totalSaves}</p>}
                {index === 8 && <p>{campaign.totalShares}</p>}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
