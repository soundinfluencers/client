import React from "react";
import type { FilterItem } from "../../../../../../types/creator-campaign/filters.types";

interface Props {
  item: FilterItem;
  selected: Set<string>;
  onToggle: (item: FilterItem, checked: boolean) => void;
}

export const FilterNode: React.FC<Props> = ({ item, selected, onToggle }) => {
  const isChecked = selected.has(item.id);

  return (
    <div className="choose">
      <div className="choose__home">
        <div className="parent_item">
          <input
            id={item.id}
            type="checkbox"
            checked={isChecked}
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
