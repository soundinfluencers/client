import React from "react";
import { Dropdown } from "@/components/table-ui/dropdowns-table";
import check from "@/assets/icons/check.svg";
import { Link } from "react-router-dom";

type Props = {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;

  platformItems: any[];
  selectedContent: number;

  selectedPd: number;
  group: string;
  setSelectedPd: (v: number) => void;

  status?: string;
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
                                                                     status,
                                                                   }: Props) {
  const descriptions = platformItems?.[selectedContent]?.descriptions ?? [];
  const isLocked = status === "closed" || status === "completed";

  const normalizeLink = React.useCallback((value: string) => {
    if (!value) return "#";
    return value.startsWith("http") ? value : `https://${value}`;
  }, []);

  const selectPd = React.useCallback(
      (idx: number) => {
        if (isLocked) return;
        setSelectedPd(idx);
        onClose();
      },
      [setSelectedPd, onClose, isLocked],
  );

  if (isLocked || descriptions.length <= 1) {
    return (
        <td className="tableBase__td">
          {group !== "press" ? (
              <div className="no-edit">
                <p className="hidden-text desc">
                  {descriptions?.[selectedPd]?.description || "—"}
                </p>
              </div>
          ) : descriptions?.[selectedPd]?.description ? (
              <Link
                  to={normalizeLink(descriptions?.[selectedPd]?.description)}
                  target="_blank"
              >
                <p className="hidden-text tagged-link">
                  {descriptions?.[selectedPd]?.description}
                </p>
              </Link>
          ) : (
              <p className="hidden-text tagged-link">—</p>
          )}
        </td>
    );
  }

  return (
      <td className="tableBase__td">
        {group !== "press" ? (
            <Dropdown
                isOpen={isOpen}
                onToggle={onToggle}
                selected={
                  <p className="hidden-text desc">
                    {descriptions?.[selectedPd]?.description || "—"}
                  </p>
                }
            >
              <ul className="dropdown-list">
                {descriptions.map((desc: any, optionIndex: number) => (
                    <li
                        title={desc?.description}
                        key={desc?._id ?? optionIndex}
                        onClick={() => selectPd(optionIndex)}
                    >
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
        ) : (
            <p>{descriptions?.[selectedPd]?.description || "—"}</p>
        )}
      </td>
  );
});