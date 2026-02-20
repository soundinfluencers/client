import React from "react";
import { Dropdown } from "@/components/table-ui/dropdowns-table";
import eye from "@/assets/icons/eye.svg";
import check from "@/assets/icons/check.svg";
import { Modal } from "@/components/ui/modal-fix/Modal";
import { VideoPreview } from "../../live-view-card/preview/preview-video-component";

type Props = {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;

  platformItems: any[];
  selectedContent: number;
  setSelectedContent: (v: number) => void;

  setSelectedPd: (v: number) => void;
  socialMedia?: string;
  media0?: any;
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
  media0,
}: Props) {
  const [popUp, setPopUp] = React.useState(false);
  const [selectedVideo, setSelectedVideo] = React.useState({
    index: 1,
    link: "",
  });
  console.log(media0, "w");
  const onClickSelect = React.useCallback(
    (optionIndex: number) => {
      setSelectedContent(optionIndex);
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

  const closeModal = React.useCallback(() => {
    setPopUp(false);
  }, []);

  const selectedLink = platformItems?.[selectedContent]?.mainLink;
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
          <ul className="dropdown-list">
            {platformItems.map((item: any, optionIndex: number) => (
              <li
                key={`${item?._id ?? optionIndex}-${socialMedia}`}
                onClick={() => onClickSelect(optionIndex)}>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onClickVideo(optionIndex, item.mainLink);
                  }}
                  className="eye">
                  <img src={eye} alt="" />
                </span>

                {item.mainLink ? `Video ${optionIndex + 1}` : "—"}

                {selectedContent === optionIndex && (
                  <img className="check" src={check} alt="" />
                )}
              </li>
            ))}
          </ul>
        </Dropdown>
      </td>

      {popUp && (
        <Modal onClose={closeModal}>
          <div className="modal-card">
            <h2>Video {selectedVideo.index}</h2>
            {media0 ? (
              <VideoPreview
                className="modal-card-video"
                videoUrl={videoUrl}
                pathLower={pathLower}
              />
            ) : (
              <input type="text" value={selectedLink} />
            )}
          </div>
        </Modal>
      )}
    </>
  );
});
