
import React from "react";
import cross from "@/assets/icons/x.svg";

import "./_bc_filter.scss";

import {
  getFilters,
  type GetFiltersBody,
} from "@/api/client/creator-campaign-page/filters.api";
import type {
  FilterData,
  FilterItem,
} from "@/types/client/creator-campaign/filters.types";
import { FilterSelect } from "./filter-select/filter-select";
import { useBuildCampaignFilters, useFilter } from "@/client-side/store";
import { FilterSkeleton } from "@/components/ui/skeletons/filtre-skeleton";

interface Props {
  onToggle: () => void;
  isSmall: boolean;
}

const buildFiltersRequestBody = ({
                                   selected,
                                   budget,
                                   budgetCurrency,
                                   filterMethod,
                                 }: {
  selected: FilterItem[];
  budget?: number | null;
  budgetCurrency?: string;
  filterMethod: "and" | "or";
}): GetFiltersBody => {
  const socialMedias = selected
      .filter((item) => item.group === "socialMedia")
      .map((item) => item.id);

  const profileTypes = selected
      .filter((item) => item.group === "profileType")
      .map((item) => item.id);

  const countries = selected
      .filter((item) => item.group === "countries")
      .flatMap((item) =>
          item.children?.length ? item.children.map((child) => child.id) : item.id,
      );

  const musicGenres = selected
      .filter((item) => item.group === "genres")
      .flatMap((item) => {
        const parent = item.id;

        if (item.children?.length) {
          return item.children.map((child) => `${parent} ${child.id}`.trim());
        }

        return [parent];
      });

  const additionalTopics = selected
      .filter((item) => item.group === "addTopics")
      .map((item) => item.id);

  const musicCategories = selected
      .filter((item) => item.group === "musicCategories")
      .map((item) => item.id);

  const entertainmentCategories = selected
      .filter((item) => item.group === "entertainmentCategories")
      .map((item) => item.id);

  return {
    socialMedias,
    profileTypes,
    musicGenres,
    musicGenresFilterMethod: filterMethod,
    countries,
    additionalTopics,
    ...(budget && budget > 0
        ? {
          budget,
          budgetCurrency: budgetCurrency || "EUR",
        }
        : {}),
    musicCategories,
    entertainmentCategories,
  };
};

export const Filters: React.FC<Props> = ({ onToggle, isSmall }) => {
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const [filter, setFilter] = React.useState<FilterData[]>([]);
  const [loading, setLoading] = React.useState(false);
  const didInitDefaults = React.useRef(false);

  const { selected, setSelected } = useFilter();
  const { selectedBudget, selectedCurrency, filterMethod } =
      useBuildCampaignFilters();

  const requestBody = React.useMemo(
      () =>
          buildFiltersRequestBody({
            selected,
            budget: selectedBudget,
            budgetCurrency: selectedCurrency.currency,
            filterMethod,
          }),
      [selected, selectedBudget, selectedCurrency.currency, filterMethod],
  );

  React.useEffect(() => {
    let cancelled = false;

    const loadFilters = async () => {
      try {
        setLoading(true);

        const response = await getFilters(requestBody);
        if (cancelled) return;

        setFilter(response?.data?.filterArr ?? []);
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setFilter([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadFilters();

    return () => {
      cancelled = true;
    };
  }, [requestBody]);

  React.useEffect(() => {
    if (didInitDefaults.current) return;
    if (!filter.length) return;

    const socialBlock = filter.find((f) => f.id === "social-platforms-1");
    const socialItems = socialBlock?.filters ?? [];
    if (!socialItems.length) return;

    const defaults = new Set(["instagram", "tiktok"]);
    const toSelect = socialItems.filter((x) => defaults.has(x.id));

    if (!toSelect.length) return;

    setSelected((prev) => {
      const hasSocialAlready = prev.some((item) => item.group === "socialMedia");
      if (hasSocialAlready) return prev;

      return [...prev, ...toSelect];
    });

    didInitDefaults.current = true;
  }, [filter, setSelected]);

  return (
      <div className={`sticky-filter ${isSmall ? "bc_filterForTable" : ""}`}>
        <div className="bc_filter">
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
                  : filter.map((data) => (
                      <FilterSelect key={data.id} data={data} />
                  ))}
            </div>
          </div>
        </div>
      </div>
  );
};