import React from "react";
import { DropdownFilter } from "./dropdownFilter/dropdown-filter";
import "./_bc_filter.scss";
interface Props {
  data?: any;
}

export const FilterSelect: React.FC<Props> = ({ data }) => {
  const [flag, setFlag] = React.useState<boolean>(false);
  const renderItem = (item: any, key: number, level = 0) => {
    return (
      <div key={key} className="choose">
        {item.children && item.children.length > 0 ? (
          <div className="choose__home">
            <div className="parent_item">
              <input id={item.filterName} type="checkbox" />
              <label htmlFor={item.filterName}>{item.filterName}</label>
              <span>{item.count}</span>
            </div>

            <div className="children">
              {item.children.map((child: any, i: number) =>
                renderItem(child, i, level + 1)
              )}
            </div>
          </div>
        ) : (
          <>
            <input id={item.filterName} type="checkbox" />
            <label htmlFor={item.filterName}>{item.filterName}</label>
            <span>{item.count}</span>
          </>
        )}
      </div>
    );
  };

  return (
    <DropdownFilter
      AndOr={data?.AndOrFlag}
      isOpen={flag}
      title={data.title}
      onToggle={() => setFlag((prev) => !prev)}>
      {data.filters.map((item, i) => (
        <div className="chooseContainer"> {renderItem(item, i)}</div>
      ))}
    </DropdownFilter>
  );
};
