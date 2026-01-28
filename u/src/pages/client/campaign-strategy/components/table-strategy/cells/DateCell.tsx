import React from "react";
import { Dropdown } from "@/components/table-ui/dropdowns-table";
import { DateInput } from "@/components/ui/inputs/date-input/date-input";
import { getDropdownOptions } from "../table-strategy.data";

type Props = {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;

  selectedDate: string;
  setSelectedDate: (v: string) => void;

  customDate: string;
  setCustomDate: (v: string) => void;
};

export const DateCell: React.FC<Props> = ({
  isOpen,
  onToggle,
  onClose,
  selectedDate,
  setSelectedDate,
  customDate,
  setCustomDate,
}) => {
  const isDate = selectedDate === "BEFORE" || selectedDate === "AFTER";

  return (
    <td className="table-strategy__td">
      <Dropdown
        isOpen={isOpen}
        onToggle={onToggle}
        selected={
          <div className={isDate ? "isDate" : undefined}>
            <p className="ellipsis" title={selectedDate}>
              {selectedDate}
            </p>

            {isDate && (
              <DateInput
                value={customDate}
                onChange={(value: string) => setCustomDate(value)}
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
                onClose();
              }}>
              {item}
            </li>
          ))}
        </ul>
      </Dropdown>
    </td>
  );
};
