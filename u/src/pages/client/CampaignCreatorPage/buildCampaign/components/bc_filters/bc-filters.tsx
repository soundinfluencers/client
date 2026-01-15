import React from "react";
import { filterArr } from "@/constants/client/filters-data";
import cross from "@/assets/icons/x.svg";
interface Props {
  onToggle: () => void;
  isSmall: boolean;
}
import "./_bc_filter.scss";
import { FilterSelect } from "./filterSelect";
export const Filters: React.FC<Props> = ({ onToggle, isSmall }) => {
  return (
    <div className={`bc_filter ${isSmall ? "bc_filterForTable" : ""}`}>
      <div className="bc_filter__sticky">
        <div className="bc_filter__head">
          <h3>Filters</h3>
          <img onClick={onToggle} src={cross} alt="" />
        </div>
        <div className="bc_filter__content">
          {filterArr.map((data, i) => (
            <FilterSelect key={i} data={data} />
          ))}
        </div>
      </div>
    </div>
  );
};
