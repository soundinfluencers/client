import React from "react";
import { Dropdown } from "@/components/table-ui/dropdowns-table";

import check from "@/assets/icons/check (1).svg";
import x from "@/assets/icons/x.svg";
import plus from "@/assets/icons/plus.svg";
import trash from "@/assets/icons/trash-2.svg";
import { Modal } from "@/components/ui/modal-fix/Modal";
import { ButtonMain, ButtonSecondary } from "@/components";
import { useUpdateCampaign } from "@/client-side/store";

type Desc = { _id?: string; description: string };

type Props = {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;

  platformItems: any[];
  selectedContent: number;

  selectedPd: number;
  setSelectedPd: (v: number) => void;
};

export const DescriptionCellEdit = React.memo(function DescriptionCellEdit({
  isOpen,
  onToggle,
  onClose,
  platformItems,
  selectedContent,
  selectedPd,
  setSelectedPd,
}: Props) {
  const baseItem = platformItems?.[selectedContent];
  const contentId: string | undefined = baseItem?._id;

  const patch = useUpdateCampaign((s) =>
    contentId ? s.patches[contentId] : undefined,
  );
  const [editIdx, setEditIdx] = React.useState<number | null>(null);
  const [editText, setEditText] = React.useState("");
  const addDescription = useUpdateCampaign((s) => s.addDescription);
  const updateDescription = useUpdateCampaign((s) => s.updateDescription);
  const removeDescription = useUpdateCampaign((s) => s.removeDescription);
  const setDescriptions = useUpdateCampaign((s) => s.setDescriptions);

  const [modal, setModal] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<number>(0);

  const serverDescs: Desc[] = baseItem?.descriptions ?? [];
  const editingDescs: Desc[] = (patch?.descriptions ?? serverDescs) as Desc[];

  const safeSelectedText = editingDescs?.[selectedPd]?.description ?? "—";

  const [isAdding, setIsAdding] = React.useState(false);
  const [newText, setNewText] = React.useState("");
  const ensurePatchDescs = React.useCallback(() => {
    if (!contentId) return;
    if (patch?.descriptions) return;
    setDescriptions(
      contentId,
      (serverDescs ?? []).map((d: any) => ({
        _id: String(d._id ?? ""),
        description: String(d.description ?? ""),
      })),
    );
  }, [contentId, patch?.descriptions, serverDescs, setDescriptions]);
  React.useEffect(() => {
    setIsAdding(false);
    setNewText("");
  }, [contentId]);

  const selectPd = React.useCallback(
    (idx: number) => {
      setSelectedPd(idx);
      onClose();
    },
    [setSelectedPd, onClose],
  );

  const startAdd = React.useCallback(() => {
    setIsAdding(true);
    setNewText("");
  }, []);

  const cancelAdd = React.useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsAdding(false);
    setNewText("");
  }, []);

  const onOpenModal = (idx: number) => {
    setModal(true);
    setSelectedId(idx);
  };
  const deleteDescription = () => {
    setModal(false);
    if (!contentId) return;

    ensurePatchDescs();
    removeDescription(contentId, selectedId);

    if (selectedPd === selectedId) setSelectedPd(Math.max(0, selectedId - 1));
    else if (selectedPd > selectedId) setSelectedPd(selectedPd - 1);

    if (editIdx === selectedId) {
      setEditIdx(null);
      setEditText("");
    }
  };
  const commitAdd = React.useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      const trimmed = newText.trim();
      if (!contentId) return;

      if (!trimmed) {
        setIsAdding(false);
        setNewText("");
        return;
      }

      ensurePatchDescs();
      addDescription(contentId, trimmed);

      setSelectedPd(editingDescs.length);

      setIsAdding(false);
      setNewText("");
    },
    [
      contentId,
      newText,
      ensurePatchDescs,
      addDescription,
      setSelectedPd,
      editingDescs.length,
    ],
  );

  if (!contentId) {
    return (
      <td className="tableBase__td">
        <p className="hidden-text desc">—</p>
      </td>
    );
  }
  React.useEffect(() => {
    setEditIdx(null);
    setEditText("");
  }, [contentId]);
  return (
    <>
      <td className="tableBase__td">
        <Dropdown
          isOpen={isOpen}
          onToggle={onToggle}
          selected={<p className="hidden-text desc">{safeSelectedText}</p>}>
          <div className="post-description-block">
            <ul className="dropdown-list">
              {editingDescs.map((desc, idx) => (
                <li key={desc?._id ?? idx} onClick={() => selectPd(idx)}>
                  <span>{idx + 1}</span>

                  {editIdx === idx ? (
                    <input
                      className="hidden-text desc-li"
                      autoFocus
                      value={editText}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setEditText(e.target.value)}
                      onBlur={() => {
                        if (!contentId) return;
                        ensurePatchDescs();
                        updateDescription(contentId, idx, editText);
                        setEditIdx(null);
                        setEditText("");
                      }}
                    />
                  ) : (
                    <p
                      className="hidden-text desc-li"
                      onClick={(e) => {
                        e.stopPropagation();
                        ensurePatchDescs();
                        setEditIdx(idx);
                        setEditText(desc.description ?? "");
                      }}
                      title={desc?.description}>
                      {desc?.description}
                    </p>
                  )}

                  <img
                    className="trash"
                    src={trash}
                    alt=""
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenModal(idx);
                    }}
                  />
                </li>
              ))}

              {isAdding && (
                <li
                  key="__new__"
                  onClick={(e) => e.stopPropagation()}
                  style={{ cursor: "default" }}>
                  <span>{editingDescs.length + 1}</span>

                  <input
                    autoFocus
                    value={newText}
                    placeholder="New description..."
                    onChange={(e) => setNewText(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />

                  <img
                    src={check}
                    alt=""
                    onClick={commitAdd}
                    style={{ cursor: "pointer" }}
                  />
                  <img
                    src={x}
                    alt=""
                    onClick={cancelAdd}
                    style={{ cursor: "pointer" }}
                  />
                </li>
              )}
            </ul>

            {!isAdding && (
              <div onClick={startAdd} className="add-desc">
                <div className="add-desc__icon">
                  <img src={plus} alt="" />
                </div>
                <p>Add new post description</p>
              </div>
            )}
          </div>
        </Dropdown>
      </td>
      {modal && (
        <Modal onClose={() => setModal(false)}>
          <div className="onDeleteModal">
            <h2>
              Are you sure you want to <br></br> delete this description?
            </h2>
            <p>You won’t be able to restore this!</p>
            <div className="onDeleteModal-btn">
              <ButtonSecondary
                text={"Cancel"}
                onClick={() => setModal(false)}
              />
              <ButtonMain text={"Delete"} onClick={deleteDescription} />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
});
