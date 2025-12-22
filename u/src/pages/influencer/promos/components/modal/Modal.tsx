import './_modal.scss';
import { createPortal } from 'react-dom';
import { type PropsWithChildren } from 'react';
import { useRef } from 'react';
import { useClickOutside } from '../../../../../hooks/useClickOutside';

interface Props extends PropsWithChildren {
  onClose: () => void;
}

export const Modal = ({ onClose, children }: Props) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useClickOutside(modalRef, onClose);

  return createPortal(
    <div className="modal" ref={modalRef}>
      <div className="modal__content">
        <h2 className="modal__title">Modal Title</h2>
        <p className="modal__body">This is the modal content.</p>
        <button className="modal__close-button" onClick={onClose}>Close</button>
        {children}
      </div>
    </div>,
    document.body
  );
};