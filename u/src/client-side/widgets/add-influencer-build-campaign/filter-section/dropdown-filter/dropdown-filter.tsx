import React from "react";
import chevronDown from "@/assets/icons/chevron-down.svg";
import "../_bc_filter.scss";
import { useBuildCampaignFilters } from "@/client-side/store";

interface Props {
  children: React.ReactNode;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  AndOr: any;
}

export const DropdownFilter: React.FC<Props> = ({
  title,
  children,
  isOpen,
  onToggle,
  AndOr,
}) => {
  const { setFiltersMethod, FilterMethod } = useBuildCampaignFilters();
  return (
    <div className="dropdown_filter">
      <div onClick={onToggle} className="dropdown_filter__head">
        <p>{title}</p>
        <img className={isOpen ? "active" : ""} src={chevronDown} alt="" />
      </div>
      {isOpen && AndOr?.length > 0 && (
        <ul className="blockWithMethod">
          {AndOr.map((ar: any, i: number) => {
            const methodLower = ar.method.toLowerCase();

            return (
              <li
                key={i}
                className={FilterMethod === methodLower ? "active" : ""}
                onClick={() => setFiltersMethod(methodLower)}>
                {ar.method}
              </li>
            );
          })}
        </ul>
      )}
      {isOpen && children}
    </div>
  );
};
