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
  group: string;
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
  group,
}: Props) {
  const descriptions = platformItems?.[selectedContent]?.descriptions ?? [];
  const [show, setShow] = React.useState(false);
  const selectPd = React.useCallback(
    (idx: number) => {
      setSelectedPd(idx);
      onClose();
    },
    [setSelectedPd, onClose],
  );
  if (descriptions.length <= 1) {
    const text = String(descriptions?.[0]?.description ?? "").trim();
    const shown = text || "—";

    return (
      <td className="tableBase__td">
        <div className="no-edit">
          <span
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}>
            <p className="hidden-text desc">{shown}</p>

            {show && (
              <div className="tooltip-box">
                {descriptions?.[selectedPd]?.description}
              </div>
            )}
          </span>
        </div>
      </td>
    );
  }
  return (
    <td className="tableBase__td">
      <Dropdown
        isOpen={isOpen}
        onToggle={onToggle}
        selected={
          <p
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
            className="hidden-text desc">
            {descriptions?.[selectedPd]?.description}{" "}
            {show && (
              <div className="tooltip-box">
                {descriptions?.[selectedPd]?.description}
              </div>
            )}
          </p>
        }>
        <ul className="dropdown-list">
          {descriptions.map((desc: any, optionIndex: number) => (
            <li
              title={desc?.description}
              key={desc?._id ?? optionIndex}
              onClick={() => selectPd(optionIndex)}>
              <span className={selectedPd === optionIndex ? "active" : ""}>
                {optionIndex + 1}
              </span>{" "}
              <p className="hidden-text desc">{desc.description || "-"}</p>
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
