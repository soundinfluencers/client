import type { FC } from "react";
import "./_button.scss";

export interface ButtonProps {
  text: string;
  onClick: () => void;
  isDisabled?: boolean;
  className?: string;
}

const handleClick = (isDisabled: boolean, onClick: () => void) => {
  if (!isDisabled) onClick();
};

export const ButtonMain: FC<ButtonProps> = ({
  text,
  onClick,
  isDisabled = false,
  className,
}: ButtonProps) => {
  return (
    <div
      className={`button-main ${isDisabled ? "disabled" : ""} ${className}`}
      onClick={() => handleClick(isDisabled, onClick)}>
      <p>{text}</p>
    </div>
  );
};

export const ButtonSecondary: FC<ButtonProps> = ({
  text,
  onClick,
  isDisabled = false,
  className,
}: ButtonProps) => {
  return (
    <div
      className={`${"button-secondary"} ${className}`}
      onClick={() => handleClick(isDisabled, onClick)}>
      <p>{text}</p>
    </div>
  );
};
