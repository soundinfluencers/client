import React from "react";
import chevronDown from "@/assets/icons/chevron-down.svg";

import "./table-ui.scss";
import { useClickOutside } from "@/hooks/global/useClickOutside";

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
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  useClickOutside(dropdownRef, () => onToggle);
  return (
    <div ref={dropdownRef} data-open={isOpen} className="table-dropdown">
      <div
        className={`table-dropdown__title ${isOpen ? "active" : ""}`}
        onClick={onToggle}>
        {selected}
        <img src={chevronDown} className="img" alt="" />
      </div>

      {isOpen && (
        <div className="table-dropdown__select">
          <div className="table-dropdown__select-contetn">{children}</div>
        </div>
      )}
    </div>
  );
};
