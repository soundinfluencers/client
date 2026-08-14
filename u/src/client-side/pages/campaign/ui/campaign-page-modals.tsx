import React from "react";
import { Modal } from "@/components/ui/modal-fix/Modal";
import { ButtonMain, ButtonSecondary } from "@/shared/ui";

type Props = {
  optionModal: boolean;

  activeOption: number;


  onCloseOptionModal: () => void;

  onAddOptionNo: () => void;

  onAddOptionYes: () => void;

  isPending: boolean;

};

export const CampaignPageModals: React.FC<Props> = ({
  optionModal,

  activeOption,


  onCloseOptionModal,

  onAddOptionNo,

  onAddOptionYes,

  isPending,

}) => {
  return (
    <>
      {optionModal && (
        <Modal onClose={onCloseOptionModal} isShowCloseButton={false}>
          <div className="create-option">
            <h2>Proposal option</h2>
            <p>
              Do you want to include the current Pages & Content from Option{" "}
              {activeOption + 1}?
            </p>
            <div className="create-option-btn">
              <ButtonSecondary
                className="btn"
                text="No"
                onClick={onAddOptionNo}
                isDisabled={isPending}
              />
              <ButtonMain
                className="btn"
                text="Yes"
                onClick={onAddOptionYes}
                isDisabled={isPending}
              />
            </div>
          </div>
        </Modal>
      )}


    </>
  );
};
