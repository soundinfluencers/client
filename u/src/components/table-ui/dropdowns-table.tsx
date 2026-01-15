import React from "react";
import chevronDown from "@/assets/icons/chevron-down.svg";
import edit from "@/assets/icons/edit.svg";
import "./table-ui.scss";

interface DropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  selected: React.ReactNode;
  children: React.ReactNode;
}

export const Dropdown: React.FC<DropdownProps> = ({
  isOpen,
  onToggle,
  selected,
  children,
}) => {
  return (
    <div className="table-dropdown">
      <div
        className={`table-dropdown__title ${isOpen ? "active" : ""}`}
        onClick={onToggle}>
        {selected}
        <img src={chevronDown} className={isOpen ? "active" : ""} alt="" />
      </div>

      {isOpen && <div className="table-dropdown__select">{children}</div>}
    </div>
  );
};
