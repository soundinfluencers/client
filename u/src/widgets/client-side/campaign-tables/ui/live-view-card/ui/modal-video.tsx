import React from "react";
import styles from "./live-view-card.module.scss";

type Props = React.PropsWithChildren<{
    onClose: () => void;
}>;

export const ModalVideo: React.FC<Props> = ({ onClose, children }) => {
    const contentRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (!contentRef.current) return;
            if (e.target instanceof Node && !contentRef.current.contains(e.target)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, [onClose]);

    return (
        <div className={styles.modal}>
            <div ref={contentRef} className={styles.modalContent}>
                <button
                    type="button"
                    className={styles.modalClose}
                    onClick={onClose}
                >
                    ×
                </button>
                {children}
            </div>
        </div>
    );
};