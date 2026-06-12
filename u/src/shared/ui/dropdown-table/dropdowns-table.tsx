import React from "react";
import * as Popover from "@radix-ui/react-popover";

import chevronDown from "./assets/chevron-down.svg";
import styles from "./dropdowns-table.module.scss";

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
            <div
                data-open={isOpen ? "true" : "false"}
                className={styles.tableDropdown}
            >
                <Popover.Trigger asChild>
                    <button
                        type="button"
                        className={`${styles.tableDropdownTitle} ${
                            isOpen ? styles.active : ""
                        }`}
                    >
                        {selected}

                        <img
                            src={chevronDown}
                            className={styles.img}
                            alt=""
                        />
                    </button>
                </Popover.Trigger>

                <Popover.Content
                    side="bottom"
                    align="start"
                    sideOffset={-5}
                    avoidCollisions={false}
                    className={`${styles.tableDropdownSelect} ${
                        content ? styles.padSelect : ""
                    }`}
                >
                    <div className={styles.tableDropdownSelectContent}>
                        {children}
                    </div>
                </Popover.Content>
            </div>
        </Popover.Root>
    );
};