import React from "react";
import { Dropdown } from "@/components/table-ui/dropdowns-table";
import check from "@/assets/icons/check.svg";
import {Link} from "react-router-dom";

type Props = {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;

  platformItems: any[];
  selectedContent: number;
  group: string;
  selectedPd: number;
  setSelectedPd: (v: number) => void;
  enableTitle?: boolean;
};

export const DescriptionCell = React.memo(function DescriptionCell({
  isOpen,
  onToggle,
  onClose,
  platformItems,
  selectedContent,
  selectedPd,
  setSelectedPd,
  enableTitle = false,
                                                                     group
}: Props) {
  const descriptions = platformItems?.[selectedContent]?.descriptions ?? [];
  const normalizeLink = React.useCallback((value: string) => {
    return value.startsWith("http") ? value : `https://${value}`;
  }, []);
  const [show, setShow] = React.useState(false);

  const selectPd = React.useCallback(
    (idx: number) => {
      setSelectedPd(idx);
      onClose();
    },
    [setSelectedPd, onClose],
  );
  // if (descriptions.length <= 1) {
  //   const text = String(descriptions?.[0]?.description ?? "").trim();
  //   const shown = text || "—";
  //
  //   return (
  //     <td className="tableBase__td">
  //       <div className="no-edit">
  //         <span
  //           onMouseEnter={() => setShow(true)}
  //           onMouseLeave={() => setShow(false)}>
  //           <p className="hidden-text desc"> {shown}</p>
  //         </span>
  //       </div>
  //     </td>
  //   );
  // }
  const rawDescription = descriptions?.[selectedPd]?.description;
  const description = typeof rawDescription === "string" && rawDescription.trim() ? rawDescription : null;
  return (
    <td className="tableBase__td">
      {group !== 'press' ? <div className="no-edit">
        <p className="hidden-text desc" title={enableTitle ? descriptions?.[selectedPd]?.description ?? "" : undefined}>
          {descriptions?.[selectedPd]?.description}
        </p>
      </div> : description ? <Link  to={normalizeLink(description)}
                      target="_blank"><p className="hidden-text tagged-link">{description}</p></Link> : <p className="hidden-text">—</p>}
    </td>
  );
});
