import React from "react";
import clsx from "clsx";

import s from './page-title.module.scss';

interface PageTitleProps {
  title: string;
  subtitle?: string;
  variants: 'public' | 'protected';

  rightSlot?: React.ReactNode;

  className?: string;
  subtitleClassName?: string;
}

export const PageTitle: React.FC<PageTitleProps> = ({
  title,
  subtitle,
  variants,
  rightSlot,
  className,
  subtitleClassName,
}) => {
  return (
    <div className={clsx(s.container, className)}>
      <h1 className={s[variants]}>{title}</h1>
      {rightSlot && rightSlot}
      {subtitle && <p className={subtitleClassName}>{subtitle}</p>}
    </div>
  );
};
