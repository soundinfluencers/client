import React from "react";
import Styles from "./container.module.scss";
interface Props {
  children: React.ReactNode;
  className?: string;
  ref?: React.RefObject<HTMLDivElement | null>;
}

// base layout container //

export const Container: React.FC<Props> = ({ children, className, ref }) => {
  return (
    <div ref={ref} className={`${Styles.container} ${className}`}>
      {children}
    </div>
  );
};
