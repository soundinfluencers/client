import React from "react";
import chevronDown from "@/assets/icons/chevron-down.svg";
import "../../buildCampaign/scss-module/_bc_select.scss";

interface DropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  selected: string;
  isChange?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({
  isOpen,
  onToggle,
  children,
  selected,
  isChange = false,
}) => {
  return (
    <div className={`BudgetPopUp ${isChange ? "less" : ""}`}>
      <div
        onClick={onToggle}
        className={`BudgetPopUp__title ${isOpen ? "active" : ""}`}>
        <p>{selected}</p>
        <img className={isOpen ? "active" : ""} src={chevronDown} alt="" />
      </div>

      {isOpen && (
        <div className={`BudgetPopUp__select ${isOpen ? "active" : ""}`}>
          {children}
        </div>
      )}
    </div>
  );
};
