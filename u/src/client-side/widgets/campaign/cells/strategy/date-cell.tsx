import React from "react";
import { Dropdown } from "@/components/table-ui/dropdowns-table";
import { DateInput } from "@/components/ui/inputs/date-input/date-input";
import { getDropdownOptions } from "@/client-side/data/table-campaign.data";

type Props = {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;

  selectedDate: string;
  setSelectedDate: (v: string) => void;

  customDate: string;
  setCustomDate: (v: string) => void;
};

export const DateCell = React.memo(function DateCell({
  isOpen,
  onToggle,
  onClose,
  selectedDate,
  setSelectedDate,
  customDate,
  setCustomDate,
}: Props) {
  const isDate = selectedDate === "BEFORE" || selectedDate === "AFTER";

  return (
    <td className="tableBase__td">
      <Dropdown
        isOpen={isOpen}
        onToggle={onToggle}
        selected={
          <div className={isDate ? "isDate" : undefined}>
            <p className="hidden-text" title={selectedDate}>
              {selectedDate}
            </p>

            {isDate && (
              <DateInput
                value={customDate}
                onChange={(value) => {
                  setCustomDate(value);

                  setSelectedDate(`${selectedDate}:${value}`);
                }}
              />
            )}
          </div>
        }>
        <ul className="dropdown-list">
          {getDropdownOptions("date").map((item: string) => (
            <li
              key={item}
              onClick={() => {
                setSelectedDate(item);
                if (item !== "BEFORE" && item !== "AFTER") {
                  setCustomDate("");
                }
                onClose();
              }}>
              {item}
            </li>
          ))}
        </ul>
      </Dropdown>
    </td>
  );
});
