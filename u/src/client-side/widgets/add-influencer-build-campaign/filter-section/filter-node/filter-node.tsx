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
      (f) => f.id === filter.id || f.children?.some((c) => c.id === filter.id),
    );

  const selectedSocialCount = selected.filter(
    (f) => f.group === "socialMedia",
  ).length;

  const checked = isChecked(item);

  const isLastSocial =
    item.group === "socialMedia" && checked && selectedSocialCount <= 1;

  return (
    <div className="choose">
      <div className="choose__home">
        <div className="parent_item">
          <input
            id={item.id}
            type="checkbox"
            checked={checked}
            disabled={isLastSocial}
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
