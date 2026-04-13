import React from "react";
import { Dropdown } from "@/components/table-ui/dropdowns-table";
import eye from "@/assets/icons/eye.svg";
import check from "@/assets/icons/check.svg";
import { Modal } from "@/components/ui/modal-fix/Modal";

type Props = {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;

  platformItems: any[];
  selectedContent: number;
  setSelectedContent: (v: number) => void;

  setSelectedPd: (v: number) => void;
  socialMedia?: string;
  group: string;
};

export const ContentCell = React.memo(function ContentCell({
                                                             isOpen,
                                                             onToggle,
                                                             onClose,
                                                             platformItems,
                                                             selectedContent,
                                                             setSelectedContent,
                                                             setSelectedPd,
                                                             socialMedia,
                                                             group,
                                                           }: Props) {
  const [popUp, setPopUp] = React.useState(false);
  const [selectedVideo, setSelectedVideo] = React.useState({
    index: 1,
    link: "",
  });

  const onClickSelect = React.useCallback(
      (optionIndex: number) => {
        setSelectedContent(optionIndex);
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

  const closeModal = React.useCallback(() => {
    setPopUp(false);
  }, []);

  const groupTitle = (group: string) => {
    switch (group) {
      case "main":
        return "Video";
      case "music":
        return "Song";
      case "press":
        return "Press";
      default:
        return "";
    }
  };

  const onClickHeaderEye = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = platformItems?.[selectedContent]?.mainLink ?? "";
    onClickVideo(selectedContent, link);
  };

  const selectedLink = platformItems?.[selectedContent]?.mainLink;

  return (
      <>
        <td className="tableBase__td">
            <div className="content-cell-static no-edit">
            <span onClick={onClickHeaderEye} className="eye">
              <img src={eye} alt="" />
            </span>
                <p title={selectedLink}>
                    {selectedLink ? `${groupTitle(group)} ${selectedContent + 1}` : "—"}
                </p>
            </div>
        </td>

        {popUp && (
            <Modal onClose={closeModal}>
              <div className="modal-card">
                <h2>{groupTitle(group)} {selectedVideo.index}</h2>
                <input type="text" value={selectedVideo.link} readOnly />
              </div>
            </Modal>
        )}
      </>
  );
});