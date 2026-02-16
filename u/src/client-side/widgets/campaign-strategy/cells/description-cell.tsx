import React from "react";
import { Dropdown } from "@/components/table-ui/dropdowns-table";
import check from "@/assets/icons/check.svg";

type Props = {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;

  platformItems: any[];
  selectedContent: number;

  selectedPd: number;
  setSelectedPd: (v: number) => void;
};

export const DescriptionCell = React.memo(function DescriptionCell({
  isOpen,
  onToggle,
  onClose,
  platformItems,
  selectedContent,
  selectedPd,
  setSelectedPd,
}: Props) {
  const descriptions = platformItems?.[selectedContent]?.descriptions ?? [];

  return (
    <td className="tableBase__td">
      <Dropdown
        isOpen={isOpen}
        onToggle={onToggle}
        selected={
          <p className="hidden-text">{descriptions[selectedPd].description}</p>
        }>
        <ul className="dropdown-list">
          {descriptions.map((desc: any, optionIndex: number) => (
            <li
              title={desc.description}
              key={desc?._id ?? optionIndex}
              onClick={() => {
                setSelectedPd(optionIndex);
                onClose();
              }}>
              <span className={selectedPd === optionIndex ? "active" : ""}>
                {optionIndex + 1}
              </span>{" "}
              <p className="hidden-text">{desc.description || "-"}</p>
              {selectedPd === optionIndex && (
                <img className="check" src={check} alt="" />
              )}
            </li>
          ))}
        </ul>
      </Dropdown>
    </td>
  );
});
