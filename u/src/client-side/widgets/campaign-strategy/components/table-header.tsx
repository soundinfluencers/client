import React from "react";
import chevron from "@/assets/icons/chevron-up.svg";
import type { SortDir } from "@/client-side/types/table-types";
import { getTitle, titles } from "@/client-side/data/table-campaign.data";
import type { TableView } from "@/client-side/utils/getColumns";

type Props = {
  columns: string[];
  followersSort: SortDir;
  onToggleFollowersSort: (dir: Exclude<SortDir, null>) => void;
  group: TableView;
};

export const TableHeader: React.FC<Props> = ({
  columns,
  followersSort,
  onToggleFollowersSort,
  group,
}) => {
  return (
    <thead>
      <tr>
        {columns.map((key) => (
          <th key={key} className="table-strategy__th">
            <div className="header-content">
              <span className="th-title">{getTitle(group, key)}</span>

              {key === "followers" && (
                <div className="switch" aria-label="Sort by followers">
                  <button
                    type="button"
                    className={`switch-btn ${followersSort === "desc" ? "active" : ""}`}
                    onClick={() => onToggleFollowersSort("desc")}
                    aria-pressed={followersSort === "desc"}
                    title="Sort desc">
                    <img className="up" src={chevron} alt="" />
                  </button>

                  <button
                    type="button"
                    className={`switch-btn ${followersSort === "asc" ? "active" : ""}`}
                    onClick={() => onToggleFollowersSort("asc")}
                    aria-pressed={followersSort === "asc"}
                    title="Sort asc">
                    <img className="down" src={chevron} alt="" />
                  </button>
                </div>
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
};
