import type { FC } from "react";
import "./_button.scss";

export interface ButtonProps {
  text: string;
  onClick: () => void;
  isDisabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const ButtonMain: FC<ButtonProps> = ({
  text,
  onClick,
  isDisabled = false,
  className,
}) => {
  return (
    <button
      type="button"
      className={`button-main ${className}`}
      disabled={isDisabled}
      onClick={onClick}>
      <p>{text}</p>
    </button>
  );
};

export const ButtonSecondary: FC<ButtonProps> = ({
  text,
  onClick,
  isDisabled = false,
  className,
  children,
}) => {
  return (
    <button
      type="button"
      className={`button-secondary ${className}`}
      disabled={isDisabled}
      onClick={onClick}>
      {children}
      <p> {text}</p>
    </button>
  );
};
