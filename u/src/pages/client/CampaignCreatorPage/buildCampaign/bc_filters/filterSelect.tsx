import React from "react";
import { DropdownFilter } from "./dropdownFilter/dropdown-filter";

import "./_bc_filter.scss";
import type {
  FilterData,
  FilterItem,
} from "../../../../../types/creator-campaign/filters.types";
import { FilterNode } from "./filter-node/filter-node";

interface Props {
  data: FilterData;
}

export const FilterSelect: React.FC<Props> = ({ data }) => {
  const { filters, AndOrFlag, title } = data;

  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const toggleItem = (item: FilterItem, checked: boolean) => {
    // copied choosen filters
    const newSet = new Set(selected);

    //use to parent and to all children
    const toggleRecursively = (node: FilterItem) => {
      checked ? newSet.add(node.id) : newSet.delete(node.id);
      node.children?.forEach(toggleRecursively);
    };

    toggleRecursively(item);

    // if at least choose on children,parent will be updated
    const updateParent = (items: FilterItem[]) => {
      items.forEach((parent) => {
        if (!parent.children) return;

        const allChecked = parent.children.some((c) => newSet.has(c.id));

        allChecked ? newSet.add(parent.id) : newSet.delete(parent.id);
        updateParent(parent.children);
      });
    };

    updateParent(filters);

    //saving state
    setSelected(newSet);
  };

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
            onToggle={toggleItem}
          />
        </div>
      ))}
    </DropdownFilter>
  );
};
