import React from "react";
import { Dropdown } from "@/components/table-ui/dropdowns-table";

import editIcon from "@/assets/icons/edit.svg";

type Desc = { _id?: string; description: string };

type Props = {
  title?: string;
  canEdit: boolean;
  contentId?: string;

  editingDescs: Desc[];

  // dropdown control
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;

  // selection
  selectedIdx: number;
  setSelectedIdx: (v: number) => void;

  // store actions
  ensurePatch: () => void;
  addDescription: (contentId: string, text: string) => void;
  updateDescription: (contentId: string, idx: number, text: string) => void;
  removeDescription: (contentId: string, idx: number) => void;
  resetDescriptions: () => void;
};

export const LiveDescriptionsEditorDropdown: React.FC<Props> = ({
  title = "Post description",
  contentId,

  editingDescs,

  isOpen,
  onToggle,

  selectedIdx,

}) => {
  const [, setEditIdx] = React.useState<number | null>(null);
  const [, setEditText] = React.useState("");
  const [, setIsAdding] = React.useState(false);
  const [, setNewText] = React.useState("");
  const [, setDeleteIdx] = React.useState<number | null>(null);

  React.useEffect(() => {
    setEditIdx(null);
    setEditText("");
    setIsAdding(false);
    setNewText("");
    setDeleteIdx(null);
  }, [contentId]);

  const safeSelectedText = editingDescs?.[selectedIdx]?.description ?? "—";

  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  if (!contentId) {
    return (
      <Dropdown
        isOpen={isOpen}
        onToggle={onToggle}
        selected={<p className="hidden-text desc">—</p>}>
        <div onClick={stop} style={{ padding: 8 }}>
          —
        </div>
      </Dropdown>
    );
  }

  return (
    <div className="live-view-card__fill-data">
      {" "}
      <h3>{title}</h3>
      <div className='fill-input'
          >

        <img src={editIcon} alt="" />
        <p className="hidden-text desc">{safeSelectedText}</p>
      </div>
    </div>
  );
};
