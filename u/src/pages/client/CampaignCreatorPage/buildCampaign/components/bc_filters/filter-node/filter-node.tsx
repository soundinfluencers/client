import React from "react";
import type { FilterItem } from "@/types/client/creator-campaign/filters.types";

interface Props {
  item: FilterItem;
  selected: FilterItem[];
  onToggle: (item: FilterItem, checked: boolean) => void;
}

export const FilterNode: React.FC<Props> = ({ item, selected, onToggle }) => {
  const isChecked = (filter: FilterItem) =>
    selected.some(
      (f) => f.id === filter.id || f.children?.some((c) => c.id === item.id)
    );

  return (
    <div className="choose">
      <div className="choose__home">
        <div className="parent_item">
          <input
            id={item.id}
            type="checkbox"
            checked={isChecked(item)}
            onChange={(e) => onToggle(item, e.target.checked)}
          />
          <label htmlFor={item.id}>{item.filterName}</label>
          <span>{item.count}</span>
        </div>

        {item.children && (
          <div className="children">
            {item.children.map((child) => (
              <FilterNode
                key={child.id}
                item={child}
                selected={selected}
                onToggle={onToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
