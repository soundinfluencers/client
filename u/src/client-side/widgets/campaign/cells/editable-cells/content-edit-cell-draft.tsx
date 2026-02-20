// content-edit-cell-strategy.tsx
import React from "react";
import { Dropdown } from "@/shared/ui/dropdowns/dropdowns-table";
import { Modal } from "@/shared/ui/modal-fix/Modal";
import eye from "@/assets/icons/eye.svg";
import plus from "@/assets/icons/plus.svg";
import trash from "@/assets/icons/trash-2.svg";
import { ButtonMain, ButtonSecondary } from "@/components";
import { useDraftCampaignStore } from "@/client-side/store";

type Props = {
  campaignId: string;
  selectedItem?: any;

  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;

  platformItems: any[];
  selectedContent: number;
  setSelectedContent: (v: number) => void;

  setSelectedPd: (v: number) => void;
  socialMedia?: string;
};

export const ContentCellEditDraft = React.memo(function ContentCellEditDraft({
  campaignId,
  selectedItem,
  isOpen,
  onToggle,
  onClose,
  platformItems,
  selectedContent,
  setSelectedContent,
  setSelectedPd,
  socialMedia,
}: Props) {
  const addContentForSocial = useDraftCampaignStore(
    (s) => s.addContentForSocial,
  );
  const removeContentItem = useDraftCampaignStore((s) => s.removeContentItem);

  const [popUp, setPopUp] = React.useState(false);
  const [selectedVideo, setSelectedVideo] = React.useState({
    index: 1,
    link: "",
  });

  const [addModal, setAddModal] = React.useState(false);
  const [newLink, setNewLink] = React.useState("");

  const [deleteModal, setDeleteModal] = React.useState(false);
  const [deleteIdx, setDeleteIdx] = React.useState<number>(-1);

  const selectedLink = platformItems?.[selectedContent]?.mainLink;

  const selectContent = React.useCallback(
    (idx: number) => {
      setSelectedContent(idx);
      setSelectedPd(0);
      onClose();
    },
    [setSelectedContent, setSelectedPd, onClose],
  );

  const onClickVideo = React.useCallback((idx: number, link: string) => {
    setSelectedVideo({ index: idx + 1, link });
    setPopUp(true);
  }, []);

  const openAddModal = React.useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setNewLink("");
    setAddModal(true);
  }, []);

  const closeAddModal = React.useCallback(() => {
    setAddModal(false);
    setNewLink("");
  }, []);

  const createVideo = React.useCallback(() => {
    const link = newLink.trim();
    if (!link) return;

    const sm = String(socialMedia ?? "").toLowerCase();
    if (!sm) return;

    addContentForSocial(campaignId, sm, { mainLink: link }, selectedItem?._id);

    setSelectedContent(platformItems.length);
    setSelectedPd(0);

    closeAddModal();
    onClose();
  }, [
    newLink,
    socialMedia,
    campaignId,
    selectedItem?._id,
    addContentForSocial,
    platformItems.length,
    setSelectedContent,
    setSelectedPd,
    closeAddModal,
    onClose,
  ]);

  const openDelete = React.useCallback((idx: number) => {
    setDeleteIdx(idx);
    setDeleteModal(true);
  }, []);

  const confirmDelete = React.useCallback(() => {
    const item = platformItems?.[deleteIdx];
    const contentId = item?._id;

    setDeleteModal(false);
    if (!contentId) return;

    removeContentItem(campaignId, String(contentId));

    setSelectedContent((prev) => {
      if (deleteIdx < 0) return prev;
      if (prev === deleteIdx) return Math.max(0, deleteIdx - 1);
      if (prev > deleteIdx) return prev - 1;
      return prev;
    });
    setSelectedPd(0);
  }, [
    platformItems,
    deleteIdx,
    removeContentItem,
    campaignId,
    setSelectedContent,
    setSelectedPd,
  ]);

  const closePreview = React.useCallback(() => setPopUp(false), []);

  return (
    <>
      <td className="tableBase__td">
        <Dropdown
          isOpen={isOpen}
          onToggle={onToggle}
          selected={
            <p title={selectedLink}>
              {selectedLink ? `Video ${selectedContent + 1}` : "—"}
            </p>
          }>
          <div className="post-description-block">
            <ul className="dropdown-list">
              {platformItems.map((item: any, idx: number) => (
                <li key={item?._id ?? idx} onClick={() => selectContent(idx)}>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      onClickVideo(idx, item.mainLink); // ✅ idx
                    }}
                    className="eye">
                    <img src={eye} alt="" />
                  </span>

                  <p
                    className="hidden-text desc-li"
                    title={item?.mainLink ?? ""}>
                    {item?.mainLink ? `Video ${idx + 1}` : "—"}
                  </p>

                  <img
                    className="trash"
                    src={trash}
                    alt=""
                    onClick={(e) => {
                      e.stopPropagation();
                      openDelete(idx);
                    }}
                  />
                </li>
              ))}
            </ul>

            <div onClick={openAddModal} className="add-desc">
              <div className="add-desc__icon">
                <img src={plus} alt="" />
              </div>
              <p>Add new video</p>
            </div>
          </div>
        </Dropdown>
      </td>

      {addModal && (
        <Modal onClose={closeAddModal}>
          <div className="modal-card">
            <h2>Add video</h2>
            <input
              autoFocus
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              type="text"
              placeholder="Paste video link..."
            />
            <div className="modal-card-btn">
              <ButtonSecondary text="Cancel" onClick={closeAddModal} />
              <ButtonMain text="Create" onClick={createVideo} />
            </div>
          </div>
        </Modal>
      )}

      {deleteModal && (
        <Modal onClose={() => setDeleteModal(false)}>
          <div className="onDeleteModal">
            <h2>
              Are you sure you want to <br /> delete this video?
            </h2>
            <p>You won’t be able to restore this!</p>
            <div className="onDeleteModal-btn">
              <ButtonSecondary
                text="Cancel"
                onClick={() => setDeleteModal(false)}
              />
              <ButtonMain text="Delete" onClick={confirmDelete} />
            </div>
          </div>
        </Modal>
      )}

      {popUp && (
        <Modal onClose={closePreview}>
          <div className="modal-card">
            <h2>Video {selectedVideo.index}</h2>
            <div className="card-player"></div>
          </div>
        </Modal>
      )}
    </>
  );
});
