import React from "react";
import { Dropdown } from "@/components/table-ui/dropdowns-table";

import editIcon from "@/assets/icons/edit.svg";
import check from "@/assets/icons/check (1).svg";
import x from "@/assets/icons/x.svg";
import plus from "@/assets/icons/plus.svg";
import trash from "@/assets/icons/trash-2.svg";

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
  canEdit,
  contentId,

  editingDescs,

  isOpen,
  onToggle,
  onClose,

  selectedIdx,
  setSelectedIdx,

  ensurePatch,
  addDescription,
  updateDescription,
  removeDescription,
  resetDescriptions,
}) => {
  const [editIdx, setEditIdx] = React.useState<number | null>(null);
  const [editText, setEditText] = React.useState("");
  const [isAdding, setIsAdding] = React.useState(false);
  const [newText, setNewText] = React.useState("");
  const [deleteIdx, setDeleteIdx] = React.useState<number | null>(null);

  React.useEffect(() => {
    setEditIdx(null);
    setEditText("");
    setIsAdding(false);
    setNewText("");
    setDeleteIdx(null);
  }, [contentId]);

  const safeSelectedText = editingDescs?.[selectedIdx]?.description ?? "—";

  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  const commitAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!contentId) return;

    const trimmed = newText.trim();
    if (!trimmed) {
      setIsAdding(false);
      setNewText("");
      return;
    }

    ensurePatch();
    addDescription(contentId, trimmed);

    setSelectedIdx(editingDescs.length);

    setIsAdding(false);
    setNewText("");
  };

  const confirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!contentId || deleteIdx === null) return;

    ensurePatch();
    removeDescription(contentId, deleteIdx);

    if (selectedIdx === deleteIdx) setSelectedIdx(Math.max(0, deleteIdx - 1));
    else if (selectedIdx > deleteIdx) setSelectedIdx(selectedIdx - 1);

    if (editIdx === deleteIdx) {
      setEditIdx(null);
      setEditText("");
    }
    setDeleteIdx(null);
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteIdx(null);
  };

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
