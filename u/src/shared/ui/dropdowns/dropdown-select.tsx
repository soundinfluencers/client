import React from "react";
import chevronDown from "@/assets/icons/chevron-down.svg";
import { useClickOutside } from "@/shared/lib/hooks/useClickOutside";
import "./_bc_select.scss";

interface DropdownProps {
  isOpen: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  children: React.ReactNode;
  selected: string;
  isChange?: boolean;
}

export const DropdownSelect: React.FC<DropdownProps> = ({
  isOpen,
  setOpen,
  children,
  selected,
  isChange = false,
}) => {
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  useClickOutside(dropdownRef, () => setOpen(false));
  return (
    <div ref={dropdownRef} className={`BudgetPopUp ${isChange ? "less" : ""}`}>
      <div
        onClick={() => setOpen((prev) => !prev)}
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
