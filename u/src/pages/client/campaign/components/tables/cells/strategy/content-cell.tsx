import React from "react";
import { Dropdown } from "@/components/table-ui/dropdowns-table";
import eye from "@/assets/icons/eye.svg";
import type { CampaignContentItem } from "@/types/store/index.types";
import type {
  DropdownKey,
  NetworkRowResolved,
  UpdateRowPatch,
} from "../../types";

type Props = {
  rowId: string;
  data: NetworkRowResolved;
  items: CampaignContentItem[];

  isOpen: (rowId: string, key: DropdownKey) => boolean;
  toggleOpen: (rowId: string, key: DropdownKey) => void;
  closeAny: () => void;

  onUpdateRow: (rowId: string, patch: UpdateRowPatch) => void;
};

export const ContentCell: React.FC<Props> = ({
  rowId,
  data,
  items,
  isOpen,
  toggleOpen,
  closeAny,
  onUpdateRow,
}) => {
  const contentDropdownOpen = isOpen(rowId, "content");

  const applyContent = (content: CampaignContentItem) => {
    const firstDescId = (content as any).descriptions?.[0]?._id ?? "";

    onUpdateRow(rowId, {
      selectedContent: {
        campaignContentItemId: content._id,
        descriptionId: firstDescId,
      },
    });

    closeAny();
  };

  return (
    <td className="table-campaign-page__td">
      <Dropdown
        isOpen={contentDropdownOpen}
        onToggle={() => toggleOpen(rowId, "content")}
        selected={
          <p className="ellipsis">{data.resolvedContent ? "Video" : "—"}</p>
        }>
        <ul className="dropdown-list">
          {items.map((it, idx) => (
            <li key={it._id} onClick={() => applyContent(it)}>
              <span
                className="eye"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(
                    (it as any).mainLink,
                    "_blank",
                    "noopener,noreferrer",
                  );
                }}>
                <img src={eye} alt="" />
              </span>
              Video {idx + 1}
            </li>
          ))}
        </ul>
      </Dropdown>
    </td>
  );
};
