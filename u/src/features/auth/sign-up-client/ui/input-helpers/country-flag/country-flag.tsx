import React, { memo } from "react";
import clsx from "clsx";

import s from "./country-flag.module.scss";

export interface CountryFlagProps {
  iso2: string;
  className?: string;
}

export const CountryFlag: React.FC<CountryFlagProps> = memo(({
                                                               iso2,
                                                               className = "",
                                                             }) => {
  const code = String(iso2 || "un").toLowerCase();

  return (
      <div
          className={clsx(`fi fi-${code}`, s.flag, className)}
          aria-hidden="true"
      />
  );
});