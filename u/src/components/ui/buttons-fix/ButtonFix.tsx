import './_custom-buttons.scss';
import React from "react";

export interface Props {
  label: string | React.ReactNode;
  onClick?: () => void;
  isDisabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export const ButtonMain: React.FC<Props> = ({
  label,
  onClick,
  isDisabled = false,
  type = "button",
  className = '',
}: Props) => {
  return (
    <button
      onClick={onClick}
      className={`custom-button custom-button-main ${className}`}
      type={type}
      disabled={isDisabled}
    >
      {label}
    </button>
  );
};

export const ButtonSecondary: React.FC<Props> = ({
  label,
  onClick,
  isDisabled = false,
  type = "button",
  className = '',
}: Props) => {
  return (
    <button
      onClick={onClick}
      className={`custom-button custom-button-secondary ${className}`}
      type={type}
      disabled={isDisabled}
    >
      {label}
    </button>
  );
};