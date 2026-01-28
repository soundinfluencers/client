import React from "react";
import { Dropdown } from "@/components/table-ui/dropdowns-table";

type Props = {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;

  platformItems: any[];
  selectedContent: number;

  selectedPd: number;
  setSelectedPd: (v: number) => void;
};

export const DescriptionCell: React.FC<Props> = ({
  isOpen,
  onToggle,
  onClose,
  platformItems,
  selectedContent,
  selectedPd,
  setSelectedPd,
}) => {
  const descriptions = platformItems?.[selectedContent]?.descriptions ?? [];

  return (
    <td className="table-strategy__td">
      <Dropdown
        isOpen={isOpen}
        onToggle={onToggle}
        selected={
          <p className="ellipsis">
            {descriptions?.[selectedPd]?.description || "—"}
          </p>
        }>
        <ul className="dropdown-list">
          {descriptions.map((desc: any, optionIndex: number) => (
            <li
              key={desc?._id ?? optionIndex}
              onClick={() => {
                setSelectedPd(optionIndex);
                onClose();
              }}>
              <span className="ellipsis" title={desc.description}>
                {desc.description || "—"}
              </span>
            </li>
          ))}
        </ul>
      </Dropdown>
    </td>
  );
};
