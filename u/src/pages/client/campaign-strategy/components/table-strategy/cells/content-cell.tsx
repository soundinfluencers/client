import React from "react";
import { Dropdown } from "@/components/table-ui/dropdowns-table";
import eye from "@/assets/icons/eye.svg";

type Props = {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;

  platformItems: any[];
  selectedContent: number;
  setSelectedContent: (v: number) => void;

  setSelectedPd: (v: number) => void;

  socialMedia?: string;
};

export const ContentCell: React.FC<Props> = ({
  isOpen,
  onToggle,
  onClose,
  platformItems,
  selectedContent,
  setSelectedContent,
  setSelectedPd,
  socialMedia,
}) => {
  return (
    <td className="table-strategy__td">
      <Dropdown
        isOpen={isOpen}
        onToggle={onToggle}
        selected={
          <p
            className="ellipsis"
            title={platformItems?.[selectedContent]?.mainLink}>
            {platformItems?.[selectedContent]?.mainLink
              ? `Video ${selectedContent + 1}`
              : "—"}
          </p>
        }>
        <ul className="dropdown-list">
          {platformItems.map((item: any, optionIndex: number) => (
            <li
              key={`${item?._id ?? optionIndex}-${socialMedia}`}
              onClick={() => {
                setSelectedContent(optionIndex);
                setSelectedPd(0);
                onClose();
              }}>
              <span className="eye">
                <img src={eye} alt="" />
              </span>
              <span className="ellipsis" title={item.mainLink}>
                {item.mainLink || "—"}
              </span>
            </li>
          ))}
        </ul>
      </Dropdown>
    </td>
  );
};
