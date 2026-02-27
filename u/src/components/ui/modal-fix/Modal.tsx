import "./_modal.scss";
import { createPortal } from "react-dom";
import { type PropsWithChildren } from "react";
import { useRef } from "react";
import { useClickOutside } from "@/hooks/global/useClickOutside.ts";
import x from "@/assets/icons/x.svg";
import React from "react";

interface Props extends PropsWithChildren {
  onClose?: () => void;
  className?: string;

  isShowCloseButton?: boolean;
  isCloseOnClickOutsideDisabled?: boolean;
}

export const Modal = ({ onClose, children, isShowCloseButton = true, isCloseOnClickOutsideDisabled = false }: Props) => {
  const modalRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useClickOutside(modalRef, () => {
    if (onClose && !isCloseOnClickOutsideDisabled) {
      onClose();
    }
  });

  return createPortal(
    <div className="modal">
      <div className="modal__content" ref={modalRef}>
        {isShowCloseButton && (
          <img
            className="modal__close-button"
            onClick={onClose}
            src={x}
            alt="Close modal"
          />
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
};
