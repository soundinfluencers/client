import React from "react";
import { Modal } from "@/components/ui/modal-fix/Modal";
import { ButtonMain, ButtonSecondary } from "@/shared/ui";

type Props = {
    optionModal: boolean;
    requestModal: boolean;
    activeOption: number;
    textareaValue: string;
    setTextareaValue: (v: string) => void;
    onCloseOptionModal: () => void;
    onCloseRequestModal: () => void;
    onAddOptionYes: () => void;
    onRequestSend: () => void;
};

export const CampaignPageModals: React.FC<Props> = ({
                                                        optionModal,
                                                        requestModal,
                                                        activeOption,
                                                        textareaValue,
                                                        setTextareaValue,
                                                        onCloseOptionModal,
                                                        onCloseRequestModal,
                                                        onAddOptionYes,
                                                        onRequestSend,
                                                    }) => {
    return (
        <>
            {optionModal && (
                <Modal onClose={onCloseOptionModal}>
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
                                onClick={onCloseOptionModal}
                            />
                            <ButtonMain
                                className="btn"
                                text="Yes"
                                onClick={onAddOptionYes}
                            />
                        </div>
                    </div>
                </Modal>
            )}

            {requestModal && (
                <Modal onClose={onCloseRequestModal}>
                    <div className="request-edit">
                        <h2>Request edit</h2>
                        <textarea
                            value={textareaValue}
                            onChange={(e) => setTextareaValue(e.target.value)}
                            placeholder="Enter your edit text"
                        />
                        <ButtonMain
                            className="btn"
                            text="Send"
                            onClick={onRequestSend}
                        />
                    </div>
                </Modal>
            )}
        </>
    );
};