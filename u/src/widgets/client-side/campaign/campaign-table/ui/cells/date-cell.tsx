import React from "react";

import type { CampaignTableRow } from "../../model/campaign-table.types";

import { DateInput } from "@/components/ui/inputs/date-input/date-input";
import { Dropdown } from "@/shared/ui/dropdown-table/dropdowns-table.tsx";
import styles from './cells.module.scss'
type Props = {
    row: CampaignTableRow;
    canEdit: boolean;
    setAccountDateRequest?: (accountKey: string, dateRequest: string) => void;
};

const OPTIONS = ["ASAP", "BEFORE", "AFTER"] as const;

export const DateTableCell: React.FC<Props> = ({
                                                   row,
                                                   canEdit,
                                                   setAccountDateRequest,
                                               }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const selectedDate = String(row.dateMode ?? "ASAP");
    const customDate = String(row.dateValue ?? "");
    const isDate = selectedDate === "BEFORE" || selectedDate === "AFTER";

    const setSelectedDate = React.useCallback(
        (nextMode: string) => {
            if (!setAccountDateRequest) return;

            if (nextMode === "BEFORE" || nextMode === "AFTER") {
                setAccountDateRequest(
                    row.accountKey,
                    customDate ? `${nextMode}:${customDate}` : nextMode,
                );

                return;
            }

            setAccountDateRequest(row.accountKey, nextMode);
        },
        [row.accountKey, customDate, setAccountDateRequest],
    );

    const setCustomDate = React.useCallback(
        (nextDate: string) => {
            if (!setAccountDateRequest) return;

            if (selectedDate === "BEFORE" || selectedDate === "AFTER") {
                setAccountDateRequest(
                    row.accountKey,
                    nextDate ? `${selectedDate}:${nextDate}` : selectedDate,
                );
            }
        },
        [row.accountKey, selectedDate, setAccountDateRequest],
    );

    if (!canEdit) {
        return (
            <div className={styles.baseLine}>
                <p >{selectedDate || "—"}</p>
                {isDate && customDate ? <p>{customDate}</p> : null}
            </div>
        );
    }

    return (
        <Dropdown
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            selected={
                <div >
                    <p title={selectedDate}>
                        {selectedDate || "—"}
                    </p>

                    {isDate && (
                        <DateInput
                            value={customDate}
                            onChange={(value) => {
                                setCustomDate(value);
                            }}
                        />
                    )}
                </div>
            }
        >
            <ul className={styles.dropdownList}>
                {OPTIONS.map((item) => (
                    <li
                        key={item}
                        onClick={() => {
                            setSelectedDate(item);
                            setIsOpen(false);
                        }}
                    >
                        {item}
                    </li>
                ))}
            </ul>
        </Dropdown>
    );
};