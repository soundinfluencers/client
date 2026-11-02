import React from "react";
import { Modal } from "@/components/ui/modal-fix/Modal";
import { ButtonMain, ButtonSecondary } from "@/shared/ui";

type Props = {
  isDirtySwitchModalOpen?: boolean;
  isDirtySwitchSaving?: boolean;
  onCloseDirtySwitchModal?: () => void;
  onSaveDirtySwitch?: () => void;
  onDiscardDirtySwitch?: () => void;
  dirtyMessage?: string;
  optionModal: boolean;

  activeOption: number;


  onCloseOptionModal: () => void;

  onAddOptionNo?: () => void;
  isOptionPending?: boolean;
  onAddOptionYes: () => void;

};

export const CampaignPageModals: React.FC<Props> = ({
  isDirtySwitchModalOpen, isDirtySwitchSaving, onCloseDirtySwitchModal, onSaveDirtySwitch, onDiscardDirtySwitch,
  dirtyMessage, optionModal,

  activeOption,


  onCloseOptionModal,

  onAddOptionNo, isOptionPending, onAddOptionYes,

}) => {
  return (
    <>
      {isDirtySwitchModalOpen && <Modal onClose={() => { if (!isDirtySwitchSaving) onCloseDirtySwitchModal?.(); }} isShowCloseButton={false} isCloseOnClickOutsideDisabled={isDirtySwitchSaving}>
        <div className="create-option"><h2>Unsaved changes</h2><p>{dirtyMessage ?? "You have unsaved changes in this option. Save them before switching to another option?"}</p>
          <ButtonSecondary text="Leave without saving" onClick={() => onDiscardDirtySwitch?.()} isDisabled={isDirtySwitchSaving}/>
          <ButtonMain text={isDirtySwitchSaving ? 'Saving...' : 'Save'} onClick={() => onSaveDirtySwitch?.()} isDisabled={isDirtySwitchSaving}/>
          <ButtonSecondary text="Cancel" onClick={() => onCloseDirtySwitchModal?.()} isDisabled={isDirtySwitchSaving}/>
        </div></Modal>}
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
                onClick={onAddOptionNo ?? onCloseOptionModal}
                isDisabled={isOptionPending}
              />
              <ButtonMain
                className="btn"
                text="Yes"
                onClick={onAddOptionYes}
                isDisabled={isOptionPending}
              />
            </div>
          </div>
        </Modal>
      )}


    </>
  );
};
