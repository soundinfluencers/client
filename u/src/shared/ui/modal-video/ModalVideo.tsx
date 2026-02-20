import Styles from "./_modal-video.module.scss";
import { createPortal } from "react-dom";
import { type PropsWithChildren } from "react";
import { useRef } from "react";
import { useClickOutside } from "../../../hooks/global/useClickOutside";
import x from "@/assets/icons/x.svg";
import React from "react";

interface Props extends PropsWithChildren {
  onClose: () => void;
  className?: string;
}

export const ModalVideo = ({ onClose, children, className }: Props) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useClickOutside(modalRef, onClose);

  return (
    <div className={`${Styles.modal} ${className}`}>
      <div className={Styles.modal__content} ref={modalRef}>
        <div className={Styles.modal__close_button}>
          <img onClick={onClose} src={x} alt="Close modal" />
        </div>
        {children}
      </div>
    </div>
  );
};
