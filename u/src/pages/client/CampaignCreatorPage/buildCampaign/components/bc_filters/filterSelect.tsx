import React from "react";
import { DropdownFilter } from "./dropdownFilter/dropdown-filter";

import "./_bc_filter.scss";
import type {
  FilterData,
  FilterItem,
} from "@/types/client/creator-campaign/filters.types";
import { FilterNode } from "./filter-node/filter-node";
import { useFilter } from "@/store/client/createCampaign";
import { useCreateCampaignPlatform } from "@/store/client/createCampaign/useCreate-campaign-fetch";
import { findPlatformFilter } from "@/utils/functions/findPlattformFilter";

interface Props {
  data: FilterData;
}

export const FilterSelect: React.FC<Props> = ({ data }) => {
  const { filters, AndOrFlag, title } = data;
  const { setSelected, selected, toggleItem } = useFilter();
  const [open, setOpen] = React.useState(false);
  const { selectedPlatform } = useCreateCampaignPlatform();
  // const toggleItem = (item: FilterItem, checked: boolean) => {
  //   // copied choosen filters
  //   const newSet = new Set(selected);

  //   //use to parent and to all children
  //   const toggleRecursively = (node: FilterItem) => {
  //     checked ? newSet.add(node.id) : newSet.delete(node.id);
  //     node.children?.forEach(toggleRecursively);
  //   };

  //   toggleRecursively(item);

  //   // if at least choose on children,parent will be updated
  //   const updateParent = (items: FilterItem[]) => {
  //     items.forEach((parent) => {
  //       if (!parent.children) return;

  //       const allChecked = parent.children.some((c) => newSet.has(c.id));

  //       allChecked ? newSet.add(parent.id) : newSet.delete(parent.id);
  //       updateParent(parent.children);
  //     });
  //   };

  //   updateParent(filters);

  //   const finalSet = new Set<string>(oldSelected);

  //   filters.forEach((parent) => {
  //     const childrenSelected =
  //       parent.children?.filter((c) => newSet.has(c.id)) || [];

  //     if (newSet.has(parent.id) && parent.children?.length) {
  //       const combined = [
  //         parent.filterName,
  //         ...childrenSelected.map((c) => c.filterName),
  //       ].join(" ");

  //       for (let f of finalSet) {
  //         if (f.startsWith(parent.filterName)) {
  //           finalSet.delete(f);
  //         }
  //       }

  //       finalSet.add(combined);
  //     } else if (newSet.has(parent.id)) {
  //       finalSet.add(parent.filterName);
  //     }
  //   });
  //   finalSet.forEach((f) => oldSelected.add(f));
  //   //saving state
  //   setSelected(newSet);
  //   setApiSelected(finalSet);
  // };
  const toggle = (item: FilterItem, checked: boolean) => {
    toggleItem(item, checked, filters);
  };
  React.useEffect(() => {
    if (!selectedPlatform) return;

    const platformFilter = findPlatformFilter(filters, selectedPlatform);

    if (!platformFilter) return;

    if (selected.some((f) => f.id === platformFilter.id)) return;

    setSelected([platformFilter]);
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
