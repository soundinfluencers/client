import './_modal.scss';
import { createPortal } from 'react-dom';
import { type PropsWithChildren } from 'react';
import { useRef } from 'react';
import { useClickOutside } from '../../../hooks/useClickOutside';
import x from "../../../assets/icons/x.svg";

interface Props extends PropsWithChildren {
  onClose: () => void;
}

export const Modal = ({ onClose, children }: Props) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useClickOutside(modalRef, onClose);

  return createPortal(
    <div className="modal">
      <div className="modal__content" ref={modalRef}>
        <img
          className="modal__close-button"
          onClick={onClose}
          src={x}
          alt="Close modal"
        />
        {children}
      </div>
    </div>,
    document.body
  );
};