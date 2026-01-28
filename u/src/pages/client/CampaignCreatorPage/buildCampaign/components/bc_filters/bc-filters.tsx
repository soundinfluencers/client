import React from "react";
import cross from "@/assets/icons/x.svg";
import { useFilter } from "@/store/client/createCampaign";
import "../../scss-module/_bc_filter.scss";

import { FilterSelect } from "./filterSelect";
import { getFilters } from "@/api/client/CreatorCampaign/getFilters/getFilters";
import type { FilterData } from "@/types/client/creator-campaign/filters.types";

interface Props {
  onToggle: () => void;
  isSmall: boolean;
}

export const Filters: React.FC<Props> = ({ onToggle, isSmall }) => {
  const [filter, setFilter] = React.useState<FilterData[]>([]);
  const { setSelected } = useFilter();

  React.useEffect(() => {
    (async () => {
      try {
        const { data } = await getFilters();
        setFilter(data.filterArr);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  React.useEffect(() => {
    const socialBlock = filter.find((f) => f.id === "social-platforms-1");
    const socialItems = socialBlock?.filters ?? [];
    if (!socialItems.length) return;

    setSelected((prev) => {
      const already = new Set(
        prev.filter((x) => x.group === "socialMedia").map((x) => x.id),
      );

      const toAdd = socialItems.filter((x) => !already.has(x.id));
      if (!toAdd.length) return prev;

      return [...prev, ...toAdd];
    });
  }, [filter, setSelected]);

  return (
    <div className={`bc_filter ${isSmall ? "bc_filterForTable" : ""}`}>
      <div className="bc_filter__sticky">
        <div className="bc_filter__head">
          <h3>Filters</h3>
          <img onClick={onToggle} src={cross} alt="" />
        </div>

        <div className="bc_filter__content">
          {filter.map((data) => (
            <FilterSelect key={data.id} data={data} />
          ))}
        </div>
      </div>
    </div>
  );
};
