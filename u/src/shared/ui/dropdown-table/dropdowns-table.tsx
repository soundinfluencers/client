import React from "react";
import * as Popover from "@radix-ui/react-popover";
import chevronDown from "./assets/chevron-down.svg";

import "./dropdowns-table.scss";

interface DropdownProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    selected: React.ReactNode;
    children: React.ReactNode;
    content?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({
                                                      isOpen,
                                                      onOpenChange,
                                                      selected,
                                                      children,
                                                      content,
                                                  }) => {
    return (
        <Popover.Root open={isOpen} onOpenChange={onOpenChange}>
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

                <Popover.Content
                    side="bottom"
                    align="start"
                    sideOffset={-5}
                    avoidCollisions={false}
                    className={`table-dropdown__select ${content ? "pad-select" : ""}`}
                >
                    <div className="table-dropdown__select-contetn">{children}</div>
                </Popover.Content>
            </div>
        </Popover.Root>
    );
};