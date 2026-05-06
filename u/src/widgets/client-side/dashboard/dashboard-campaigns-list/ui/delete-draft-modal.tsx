import { ButtonMain, ButtonSecondary } from "@/components";
import { Modal } from "@/shared/ui/modal-fix/Modal";
import styles from "./delete-draft-modal.module.scss";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting?: boolean;
};

export const DeleteDraftModal = ({
                                     isOpen,
                                     onClose,
                                     onConfirm,
                                     isDeleting = false,
                                 }: Props) => {
    if (!isOpen) return null;

    return (
        <Modal addStyles="content-width" onClose={onClose}>
            <div className={styles.deleteModal}>
                <h2>
                    Are you sure you want to <br /> delete this draft?
                </h2>

                <p>You won’t be able to restore this!</p>

                <div className={styles.deleteModalButtons}>
                    <ButtonSecondary
                        className={styles.button}
                        text="Cancel"
                        onClick={onClose}
                    />
                    <ButtonMain
                        className={styles.button}
                        text={isDeleting ? "Deleting..." : "Delete"}
                        onClick={onConfirm}
                    />
                </div>
            </div>
        </Modal>
    );
};