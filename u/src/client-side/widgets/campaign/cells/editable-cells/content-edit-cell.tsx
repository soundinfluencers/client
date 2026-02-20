import React from "react";
import { Dropdown } from "@/shared/ui/dropdowns/dropdowns-table";
import { Modal } from "@/shared/ui/modal-fix/Modal";
import { useProposalAccountsStore } from "@/client-side/store";
import eye from "@/assets/icons/eye.svg";

import check from "@/assets/icons/check (1).svg";
import plus from "@/assets/icons/plus.svg";
import trash from "@/assets/icons/trash-2.svg";

import { ButtonMain, ButtonSecondary } from "@/components";
import { VideoPreview } from "../../live-view-card/preview/preview-video-component";

type Props = {
  optionIndex: number;
  accountKey: string;
  selectedItem?: any;

  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;

  platformItems: any[];
  selectedContent: number;
  setSelectedContent: (v: number) => void;

  setSelectedPd: (v: number) => void;
  socialMedia?: string;
  media0: any;
};

export const ContentCellEdit = React.memo(function ContentCellEdit({
  optionIndex,
  accountKey,
  selectedItem,

  isOpen,
  onToggle,
  onClose,

  platformItems,
  selectedContent,
  setSelectedContent,
  setSelectedPd,

  socialMedia,
  media0,
}: Props) {
  const addContentForSocial = useProposalAccountsStore(
    (s) => s.addContentForSocial,
  );
  const removeContentItem = useProposalAccountsStore(
    (s) => s.removeContentItem,
  );
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
  console.log(platformItems, "sl");
  const selectContent = React.useCallback(
    (idx: number) => {
      setSelectedContent(idx);
      setSelectedPd(0);
      onClose();
    },
    [setSelectedContent, setSelectedPd, onClose],
  );
  const onClickVideo = React.useCallback(
    (optionIndex: number, link: string) => {
      setSelectedVideo({ index: optionIndex + 1, link });
      setPopUp(true);
    },
    [],
  );
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

    addContentForSocial(optionIndex, sm, { mainLink: link }, selectedItem?._id);

    setSelectedContent(platformItems.length);
    setSelectedPd(0);

    closeAddModal();
    onClose();
  }, [
    newLink,
    socialMedia,
    optionIndex,
    selectedItem?._id,
    addContentForSocial,
    platformItems.length,
    setSelectedContent,
    setSelectedPd,
    closeAddModal,
    onClose,
  ]);
  const closeModal = React.useCallback(() => {
    setPopUp(false);
  }, []);
  const openDelete = React.useCallback((idx: number) => {
    setDeleteIdx(idx);
    setDeleteModal(true);
  }, []);
  const closeModalVideo = React.useCallback(() => {
    setPopUp(false);
  }, []);
  const confirmDelete = React.useCallback(() => {
    const item = platformItems?.[deleteIdx];
    const contentId = item?._id;

    setDeleteModal(false);
    if (!contentId) return;

    removeContentItem(optionIndex, String(contentId));

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
    optionIndex,
    setSelectedContent,
    setSelectedPd,
  ]);
  const pathLower = media0?.pathLower;
  const videoUrl = media0?.url ?? null;
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
                      onClickVideo(idx, item.mainLink);
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
      )}{" "}
      {popUp && (
        <Modal onClose={closeModalVideo}>
          <div className="modal-card">
            <h2>Video {selectedVideo.index}</h2>
            {media0 && (
              <VideoPreview
                className="modal-card-video"
                videoUrl={videoUrl}
                pathLower={pathLower}
              />
            )}
          </div>
        </Modal>
      )}
    </>
  );
});
