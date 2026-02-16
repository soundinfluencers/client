import React from "react";
import cross from "@/assets/icons/x.svg";

import "./_bc_filter.scss";

import { getFilters } from "@/api/client/creator-campaign-page/filters.api";
import type { FilterData } from "@/types/client/creator-campaign/filters.types";
import { FilterSelect } from "./filter-select/filter-select";
import { useFilter } from "@/client-side/store";
import { FilterSkeleton } from "@/components/ui/skeletons/filtre-skeleton";

interface Props {
  onToggle: () => void;
  isSmall: boolean;
}

export const Filters: React.FC<Props> = ({ onToggle, isSmall }) => {
  const [filter, setFilter] = React.useState<FilterData[]>([]);
  const [loading, setLoading] = React.useState(false);
  const { setSelected } = useFilter();

  React.useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const { data } = await getFilters();

        setFilter(data.filterArr);
        setLoading(false);
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
          {loading
            ? Array.from({ length: 12 }).map((_, index) => (
                <FilterSkeleton key={index} />
              ))
            : filter.map((data) => <FilterSelect key={data.id} data={data} />)}
        </div>
      </div>
    </div>
  );
};
