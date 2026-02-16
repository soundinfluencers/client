import React from "react";

import { Modal } from "@/components/ui/modal-fix/Modal";
import { ButtonMain, ButtonSecondary } from "@/components";

import check from "@/assets/icons/check (1).svg";
import x from "@/assets/icons/x.svg";
import plus from "@/assets/icons/plus.svg";
import trash from "@/assets/icons/trash-2.svg";
import edit from "@/assets/icons/edit.svg";
import { useUpdateCampaign } from "@/client-side/store";

type Desc = { _id?: string; description: string };

type Props = {
  canEdit: boolean;
  contentId?: string;
  serverDescs: Desc[];
  editingDescs: Desc[];
};

export const PostDescriptionsEditor: React.FC<Props> = ({
  canEdit,
  contentId,
  serverDescs,
  editingDescs,
}) => {
  const addDescription = useUpdateCampaign((s) => s.addDescription);
  const updateDescription = useUpdateCampaign((s) => s.updateDescription);
  const removeDescription = useUpdateCampaign((s) => s.removeDescription);
  const setDescriptions = useUpdateCampaign((s) => s.setDescriptions);

  const [editIdx, setEditIdx] = React.useState<number | null>(null);
  const [editText, setEditText] = React.useState("");

  const [isAdding, setIsAdding] = React.useState(false);
  const [newText, setNewText] = React.useState("");

  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [deleteIdx, setDeleteIdx] = React.useState<number>(-1);

  React.useEffect(() => {
    setEditIdx(null);
    setEditText("");
    setIsAdding(false);
    setNewText("");
    setConfirmDelete(false);
    setDeleteIdx(-1);
  }, [contentId]);

  if (!contentId) return <div className="fill-input">—</div>;

  const onCommitAdd = () => {
    const trimmed = newText.trim();
    if (!trimmed) {
      setIsAdding(false);
      setNewText("");
      return;
    }
    addDescription(contentId, editingDescs, trimmed);
    setIsAdding(false);
    setNewText("");
  };

  const onAskDelete = (idx: number) => {
    setDeleteIdx(idx);
    setConfirmDelete(true);
  };

  const onDelete = () => {
    setConfirmDelete(false);
    if (deleteIdx < 0) return;
    removeDescription(contentId, editingDescs, deleteIdx);
    if (editIdx === deleteIdx) {
      setEditIdx(null);
      setEditText("");
    }
    setDeleteIdx(-1);
  };

  return (
    <div className="live-view-card__fill-data">
      <h3>Post description</h3>

      <div className="fill-input">
        <img src={edit} alt="" />

        <div className="descr" style={{ width: "100%" }}>
          {editingDescs.map((d, idx) => (
            <div
              key={d?._id ?? idx}
              style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span>{idx + 1}</span>

              {!canEdit ? (
                <p className="hidden-text" title={d.description}>
                  {d.description}
                </p>
              ) : editIdx === idx ? (
                <input
                  style={{ flex: 1 }}
                  autoFocus
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={() => {
                    updateDescription(contentId, editingDescs, idx, editText);
                    setEditIdx(null);
                    setEditText("");
                  }}
                />
              ) : (
                <p
                  className="hidden-text"
                  style={{ flex: 1, cursor: "text" }}
                  title={d.description}
                  onClick={() => {
                    setEditIdx(idx);
                    setEditText(d.description ?? "");
                  }}>
                  {d.description}
                </p>
              )}

              {canEdit && (
                <img
                  src={trash}
                  alt=""
                  style={{ cursor: "pointer" }}
                  onClick={() => onAskDelete(idx)}
                />
              )}
            </div>
          ))}

          {canEdit && isAdding && (
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                marginTop: 8,
              }}>
              <span>{editingDescs.length + 1}</span>
              <input
                style={{ flex: 1 }}
                autoFocus
                value={newText}
                placeholder="New description..."
                onChange={(e) => setNewText(e.target.value)}
              />
              <img
                src={check}
                alt=""
                style={{ cursor: "pointer" }}
                onClick={onCommitAdd}
              />
              <img
                src={x}
                alt=""
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setIsAdding(false);
                  setNewText("");
                }}
              />
            </div>
          )}

          {canEdit && !isAdding && (
            <div
              className="add-desc"
              style={{
                marginTop: 10,
                cursor: "pointer",
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
              onClick={() => setIsAdding(true)}>
              <div className="add-desc__icon">
                <img src={plus} alt="" />
              </div>
              <p>Add new post description</p>
            </div>
          )}

          {canEdit && (
            <button
              type="button"
              style={{ marginTop: 10 }}
              onClick={() => setDescriptions(contentId, serverDescs)}>
              reset
            </button>
          )}
        </div>
      </div>

      {confirmDelete && (
        <Modal onClose={() => setConfirmDelete(false)}>
          <div className="onDeleteModal">
            <h2>
              Are you sure you want to <br /> delete this description?
            </h2>
            <p>You won’t be able to restore this!</p>
            <div className="onDeleteModal-btn">
              <ButtonSecondary
                text={"Cancel"}
                onClick={() => setConfirmDelete(false)}
              />
              <ButtonMain text={"Delete"} onClick={onDelete} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
