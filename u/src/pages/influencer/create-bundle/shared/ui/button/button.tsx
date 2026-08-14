import { type ElementType, type ComponentPropsWithoutRef } from "react";
import clsx from "clsx";

import styles from "./button.module.scss";

type ButtonProps<T extends ElementType = "button"> = {
  as?: T;
  variant?: "primary" | "secondary" | "gradient";
  size?: "small" | "medium" | "large";
} & ComponentPropsWithoutRef<T>;

export const Button = <T extends ElementType = "button">({
  as,
  children,
  variant = "primary",
  size = "medium",
  className,
  ...props
}: ButtonProps<T>) => {
  const Component = as || "button";

  return (
    <Component
      className={clsx(
        styles.button,
        styles[variant],
        styles[size],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};
