import React from "react";
import { Dropdown } from "@/components/table-ui/dropdowns-table";

import editIcon from "@/assets/icons/edit.svg";
import check from "@/assets/icons/check (1).svg";
import x from "@/assets/icons/x.svg";
import plus from "@/assets/icons/plus.svg";
import trash from "@/assets/icons/trash-2.svg";

type Desc = {
  _id?: string;
  description: string;
};

type Props = {
  title?: string;
  canEdit: boolean;
  contentId?: string;
  editingDescs: Desc[];

  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;

  selectedIdx: number;
  setSelectedIdx: (v: number) => void;

  ensurePatch: () => void;
  addDescription: (contentId: string, text: string) => void;
  updateDescription: (contentId: string, idx: number, text: string) => void;
  removeDescription: (contentId: string, idx: number) => void;
  resetDescriptions: () => void;

  onSelectDescriptionId?: (descriptionId: string) => void;
  setDescriptions?: (contentId: string, next: Desc[]) => void;
};

const createLocalId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 24);
  }

  return Math.random().toString(16).slice(2).padEnd(24, "0").slice(0, 24);
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
                                                                  onSelectDescriptionId,
                                                                  setDescriptions,
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

  const safeSelectedText =
      editingDescs?.[selectedIdx]?.description ||
      editingDescs?.[0]?.description ||
      "—";

  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  const selectDescription = React.useCallback(
      (idx: number) => {
        const nextId = String(editingDescs?.[idx]?._id ?? "");
        setSelectedIdx(idx);
        onSelectDescriptionId?.(nextId);
        onClose();
      },
      [editingDescs, setSelectedIdx, onSelectDescriptionId, onClose],
  );

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

    if (setDescriptions) {
      const created: Desc = {
        _id: createLocalId(),
        description: trimmed,
      };

      const nextDescs = [...editingDescs, created];
      setDescriptions(contentId, nextDescs);

      const nextIndex = nextDescs.length - 1;
      setSelectedIdx(nextIndex);
      onSelectDescriptionId?.(String(created._id ?? ""));
    } else {
      addDescription(contentId, trimmed);
      const nextIndex = editingDescs.length;
      setSelectedIdx(nextIndex);
    }

    setIsAdding(false);
    setNewText("");
  };

  const confirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!contentId || deleteIdx === null) return;

    ensurePatch();
    removeDescription(contentId, deleteIdx);

    const nextDescs = editingDescs.filter((_, idx) => idx !== deleteIdx);

    let nextSelectedIdx = selectedIdx;

    if (selectedIdx === deleteIdx) {
      nextSelectedIdx = Math.max(0, deleteIdx - 1);
    } else if (selectedIdx > deleteIdx) {
      nextSelectedIdx = selectedIdx - 1;
    }

    setSelectedIdx(nextSelectedIdx);
    onSelectDescriptionId?.(String(nextDescs?.[nextSelectedIdx]?._id ?? ""));

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
            selected={<p className="hidden-text desc">—</p>}
        >
          <div onClick={stop} style={{ padding: 8 }}>
            —
          </div>
        </Dropdown>
    );
  }

  return (
      <div className="live-view-card__fill-data">
        <h3>{title}</h3>

        <Dropdown
            isOpen={isOpen}
            onToggle={onToggle}
            selected={
              <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    height: "26px",
                  }}
              >
                <img src={editIcon} alt="" />
                <p className="hidden-text desc">{safeSelectedText}</p>
              </div>
            }
        >
          <div className="post-description-block" onClick={stop}>
            <ul className="dropdown-list">
              {editingDescs.map((desc, idx) => (
                  <li
                      key={desc?._id ?? idx}
                      className="desc-li"
                      onClick={() => selectDescription(idx)}
                  >
                <span className={selectedIdx === idx ? "active" : ""}>
                  {idx + 1}
                </span>

                    {!canEdit ? (
                        <p className="hidden-text desc-li" title={desc.description}>
                          {desc.description}
                        </p>
                    ) : editIdx === idx ? (
                        <input
                            className="hidden-text desc-li"
                            autoFocus
                            value={editText}
                            onClick={stop}
                            onChange={(e) => setEditText(e.target.value)}
                            onBlur={() => {
                              ensurePatch();
                              updateDescription(contentId, idx, editText);

                              const currentId = String(editingDescs?.[idx]?._id ?? "");
                              onSelectDescriptionId?.(currentId);

                              setEditIdx(null);
                              setEditText("");
                            }}
                        />
                    ) : (
                        <p
                            className="hidden-text desc-li"
                            title={desc.description}
                            onClick={(e) => {
                              e.stopPropagation();
                              ensurePatch();
                              setEditIdx(idx);
                              setEditText(desc.description ?? "");
                            }}
                        >
                          {desc.description}
                        </p>
                    )}

                    {canEdit &&
                        (deleteIdx === idx ? (
                            <div className="confirm-delete" onClick={stop}>
                              <img
                                  src={check}
                                  alt=""
                                  style={{ cursor: "pointer" }}
                                  onClick={confirmDelete}
                              />
                              <img
                                  src={x}
                                  alt=""
                                  style={{ cursor: "pointer" }}
                                  onClick={cancelDelete}
                              />
                            </div>
                        ) : (
                            <img
                                className="trash"
                                src={trash}
                                alt=""
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteIdx(idx);
                                }}
                            />
                        ))}
                  </li>
              ))}

              {canEdit && isAdding && (
                  <li
                      className="desc-li"
                      onClick={stop}
                      style={{ cursor: "default" }}
                  >
                    <span>{editingDescs.length + 1}</span>

                    <input
                        autoFocus
                        value={newText}
                        placeholder={`New ${title.toLowerCase()}...`}
                        onChange={(e) => setNewText(e.target.value)}
                        onClick={stop}
                    />

                    <div className="confirm-delete" onClick={stop}>
                      <img
                          src={check}
                          alt=""
                          style={{ cursor: "pointer" }}
                          onClick={commitAdd}
                      />
                      <img
                          src={x}
                          alt=""
                          style={{ cursor: "pointer" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsAdding(false);
                            setNewText("");
                          }}
                      />
                    </div>
                  </li>
              )}
            </ul>

            {canEdit && !isAdding && (
                <div
                    className="add-desc"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAdding(true);
                      setNewText("");
                    }}
                >
                  <div className="add-desc__icon">
                    <img src={plus} alt="" />
                  </div>
                  <p>Add new {title.toLowerCase()}</p>
                </div>
            )}
          </div>
        </Dropdown>
      </div>
  );
};