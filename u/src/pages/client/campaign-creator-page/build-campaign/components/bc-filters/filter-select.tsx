import React from "react";
import { DropdownFilter } from "./dropdown-filter/dropdown-filter";

import "../../scss-module/_bc_filter.scss";

import type {
  FilterData,
  FilterItem,
} from "@/types/client/creator-campaign/filters.types";
import { FilterNode } from "./filter-node/filter-node";
import { useFilter } from "@/store/client/create-campaign";
import { useCreateCampaignPlatform } from "@/store/client/create-campaign";
import { findPlatformFilter } from "@/utils/functions/findPlattformFilter";

interface Props {
  data: FilterData;
}

export const FilterSelect: React.FC<Props> = ({ data }) => {
  const didInitPlatform = React.useRef(false);
  const { filters, AndOrFlag, title } = data;
  const { setSelected, selected, toggleItem } = useFilter();
  const [open, setOpen] = React.useState(false);
  const { selectedPlatform } = useCreateCampaignPlatform();
  const toggle = (item: FilterItem, checked: boolean) => {
    toggleItem(item, checked, filters);
  };

  React.useEffect(() => {
    if (!selectedPlatform) return;
    if (didInitPlatform.current) return;
    didInitPlatform.current = true;

    const platformFilter = findPlatformFilter(filters, selectedPlatform);
    if (!platformFilter) return;

    if (selected.some((f) => f.id === platformFilter.id)) return;
    setSelected([...selected, platformFilter]);
  }, [selectedPlatform]);
  return (
    <DropdownFilter
      AndOr={AndOrFlag}
      isOpen={open}
      title={title}
      onToggle={() => setOpen((p) => !p)}>
      {filters.map((item) => (
        <div className="chooseContainer">
          <FilterNode
            key={item.id}
            item={item}
            selected={selected}
            onToggle={toggle}
          />
        </div>
      ))}
    </DropdownFilter>
  );
};
