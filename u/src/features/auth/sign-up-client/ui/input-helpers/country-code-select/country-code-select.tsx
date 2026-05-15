import React from "react";
import clsx from "clsx";

import s from "./country-code-select.module.scss";
import { CountryFlag } from "@components/ui/phone-input-v2/PhoneInputV2.tsx";

interface CountryCodeSelectProps {
  iso2: string;
  isOpen: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const ChevronIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
    >
      <path
          d="M9 18L15 12L9 6"
          stroke="#2A2A2A"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
      />
    </svg>
);

export const CountryCodeSelect: React.FC<CountryCodeSelectProps> = ({
                                                                      iso2,
                                                                      isOpen,
                                                                      onToggle,
                                                                      disabled,
                                                                    }) => {
  return (
      <button
          type="button"
          className={s.countryCodeSelect}
          aria-label="Select country code"
          disabled={disabled}
          aria-expanded={isOpen}
          onMouseDown={(e) => {
            e.preventDefault();
            onToggle();
          }}
      >
        <CountryFlag iso2={iso2} />

        <ChevronIcon className={clsx(s.chevronIcon, isOpen && s.chevronOpen)} />
      </button>
  );
};