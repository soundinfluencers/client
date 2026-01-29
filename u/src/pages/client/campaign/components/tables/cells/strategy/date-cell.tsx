import React from "react";
import { Dropdown } from "@/components/table-ui/dropdowns-table";
import { DateInput } from "@/components/ui/inputs/date-input/date-input";

import type {
  DropdownKey,
  NetworkRowResolved,
  UpdateRowPatch,
} from "../../types";
import {
  getDropdownOptions,
  ReqData,
} from "../../campaign-table/table-campaign.data";

type Props = {
  rowId: string;
  data: NetworkRowResolved;

  isOpen: (rowId: string, key: DropdownKey) => boolean;
  toggleOpen: (rowId: string, key: DropdownKey) => void;
  closeAny: () => void;

  onUpdateRow: (rowId: string, patch: UpdateRowPatch) => void;
};

export const DateCell: React.FC<Props> = ({
  rowId,
  data,
  isOpen,
  toggleOpen,
  closeAny,
  onUpdateRow,
}) => {
  const initialDate = (data as any).dateRequest ?? ReqData[0];
  const [selectedDate, setSelectedDate] = React.useState<string>(initialDate);
  const [customDate, setCustomDate] = React.useState<string>("");

  React.useEffect(() => {
    setSelectedDate((data as any).dateRequest ?? ReqData[0]);
  }, [(data as any).dateRequest]);

  const dateDropdownOpen = isOpen(rowId, "date");
  const isDateWithInput = selectedDate === "BEFORE" || selectedDate === "AFTER";

  const applyDate = (value: string) => {
    setSelectedDate(value);
    onUpdateRow(rowId, { dateRequest: value });
    closeAny();
  };

  return (
    <td className="table-campaign-page__td">
      <Dropdown
        isOpen={dateDropdownOpen}
        onToggle={() => toggleOpen(rowId, "date")}
        selected={
          <div className={isDateWithInput ? "isDate" : ""}>
            <p className="ellipsis" title={selectedDate}>
              {selectedDate}
            </p>

            {isDateWithInput && (
              <DateInput
                value={customDate}
                onChange={(value: string) => {
                  setCustomDate(value);
                  onUpdateRow(rowId, {
                    dateRequest: `${selectedDate} ${value}`,
                  });
                }}
              />
            )}
          </div>
        }>
        <ul className="dropdown-list">
          {getDropdownOptions("date").map((opt) => (
            <li key={opt} onClick={() => applyDate(opt)}>
              {opt}
            </li>
          ))}
        </ul>
      </Dropdown>
    </td>
  );
};
