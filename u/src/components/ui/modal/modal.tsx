import React from "react";
import x from "../../../assets/icons/x.svg";
import { createPortal } from "react-dom";
import "./_modal.scss";

interface Props {
  title: string;
  onToggle: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<Props> = ({ title, onToggle, children }) => {
  return createPortal(
    <div className="overlay">
      <div className="overlay-modal">
        <img onClick={onToggle} src={x} alt="" />
        <h3>{title}</h3>
        {children}
      </div>
    </div>,
    document.body
  );
};
