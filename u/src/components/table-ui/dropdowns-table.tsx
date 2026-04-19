import React from "react";
import * as Popover from "@radix-ui/react-popover";
import chevronDown from "@/assets/icons/chevron-down.svg";

import "./table-ui.scss";

interface DropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  selected: React.ReactNode;
  children: React.ReactNode;
  content?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({
                                                    isOpen,
                                                    onToggle,
                                                    selected,
                                                    children,
                                                    content,
                                                  }) => {
  return (
      <Popover.Root open={isOpen} onOpenChange={() => onToggle()}>
        <div data-open={isOpen} className="table-dropdown">
          <Popover.Trigger asChild>
            <button
                type="button"
                className={`table-dropdown__title ${isOpen ? "active" : ""}`}
            >
              {selected}
              <img src={chevronDown} className="img" alt="" />
            </button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
                side="bottom"
                align="start"
                sideOffset={-6}
                avoidCollisions
                className={`table-dropdown__select ${content ? "pad-select" : ""}`}
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <div className="table-dropdown__select-contetn">{children}</div>
            </Popover.Content>
          </Popover.Portal>
        </div>
      </Popover.Root>
  );
};