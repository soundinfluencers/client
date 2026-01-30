import React from "react";
import { Dropdown } from "@/components/table-ui/dropdowns-table";
import plus from "@/assets/icons/plus.svg";
import type {
  DropdownKey,
  NetworkRowResolved,
  UpdateRowPatch,
  CampaignContentDescription,
} from "../../types";

type Props = {
  rowId: string;
  data: NetworkRowResolved;

  isOpen: (rowId: string, key: DropdownKey) => boolean;
  toggleOpen: (rowId: string, key: DropdownKey) => void;
  closeAny: () => void;

  onUpdateRow: (rowId: string, patch: UpdateRowPatch) => void;

  extraDescriptionsByContentId: Record<string, CampaignContentDescription[]>;
  addDescriptionForContent: (contentId: string, text: string) => string;
};

export const DescriptionCell: React.FC<Props> = ({
  rowId,
  data,
  isOpen,
  toggleOpen,
  closeAny,
  onUpdateRow,
  extraDescriptionsByContentId,
  addDescriptionForContent,
}) => {
  const descDropdownOpen = isOpen(rowId, "postDescription");
  const activeContent = data.resolvedContent;
  const activeDescription = data.resolvedDescription;

  const contentId = (data as any).selectedContent?.campaignContentItemId as
    | string
    | undefined;

  const contentDescriptions: CampaignContentDescription[] =
    (((activeContent as any)?.descriptions ??
      []) as CampaignContentDescription[]) ?? [];

  const localDescriptions = contentId
    ? (extraDescriptionsByContentId[contentId] ?? [])
    : [];

  const activeDescriptions: CampaignContentDescription[] = [
    ...contentDescriptions,
    ...localDescriptions,
  ];

  const applyDescription = (descId: string) => {
    if (!contentId) return;
    onUpdateRow(rowId, {
      selectedContent: {
        campaignContentItemId: contentId,
        descriptionId: descId,
      },
    });
    closeAny();
  };

  const [addingDesc, setAddingDesc] = React.useState(false);
  const [newDescText, setNewDescText] = React.useState("");

  const canAdd = Boolean(contentId);

  return (
    <td className="table-campaign-page__td">
      <Dropdown
        isOpen={descDropdownOpen}
        onToggle={() => toggleOpen(rowId, "postDescription")}
        selected={
          <p className="ellipsis">{activeDescription?.description ?? "—"}</p>
        }>
        <div className="post-description-block">
          <ul className="dropdown-list ellipsis">
            {activeDescriptions.length ? (
              activeDescriptions.map((d, i) => (
                <li key={d._id} onClick={() => applyDescription(d._id)}>
                  <span>{i + 1}</span>
                  {d.description}
                </li>
              ))
            ) : (
              <li style={{ opacity: 0.7, pointerEvents: "none" }}>
                No descriptions
              </li>
            )}
          </ul>
          {addingDesc && (
            <div className="add-desc-form">
              <input
                value={newDescText}
                onChange={(e) => setNewDescText(e.target.value)}
                placeholder="Type new description..."
              />

              <div className="add-desc-actions">
                <button
                  type="button"
                  onClick={() => {
                    if (!contentId) return;

                    const text = newDescText.trim();
                    if (!text) return;

                    const newId = addDescriptionForContent(contentId, text);

                    onUpdateRow(rowId, {
                      selectedContent: {
                        campaignContentItemId: contentId,
                        descriptionId: newId,
                      },
                    });

                    setNewDescText("");
                    setAddingDesc(false);
                    closeAny();
                  }}>
                  Save
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNewDescText("");
                    setAddingDesc(false);
                  }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
          <div
            className="Add-PD"
            onClick={() => {
              if (!canAdd) return;
              setAddingDesc(true);
            }}
            role="button"
            tabIndex={0}
            style={
              !canAdd ? { opacity: 0.5, pointerEvents: "none" } : undefined
            }
            title={!canAdd ? "Select Content first" : undefined}>
            <div className="Add-PD__icon">
              <img src={plus} alt="" />
            </div>
            <p>Add new post description</p>
          </div>
        </div>
      </Dropdown>
    </td>
  );
};
