import React, { useRef, useState } from "react";
import clsx from "clsx";

import s from "./company-type-select.module.scss";
import { Input } from "@/features/auth/sign-up-client/ui/input/input.tsx";
import { COMPANY_TYPE } from "@/features/auth/sign-up-client/model/sign-up-client-form.schema.ts";
import {useClickOutside} from "@/hooks/global/useClickOutside.ts";


interface CompaniesTypeSelectProps {
  value: string | null;
  name?: string;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  readonly?: boolean;

  onCommit: (value: string | null) => void;
  onBlur?: () => void;
}

const ChevronIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
      <path
          d="M9 18L15 12L9 6"
          stroke="#202934"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
      />
    </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
      <path
          d="M20 6L9 17L4 12"
          stroke="#B9D0FF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
      />
    </svg>
);

export const CompanyTypeSelect: React.FC<CompaniesTypeSelectProps> = ({
                                                                        value,
                                                                        name,
                                                                        label,
                                                                        placeholder,
                                                                        error,
                                                                        disabled = false,
                                                                        readonly = true,
                                                                        onCommit,
                                                                        onBlur,
                                                                      }) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const visibleError = isOpen ? undefined : error;

  const closeSelect = () => {
    setIsOpen(false);
    onBlur?.();
  };

  const toggleOpen = () => {
    if (disabled) return;

    setIsOpen((prev) => {
      const next = !prev;

      if (!next) {
        onBlur?.();
      }

      return next;
    });
  };

  useClickOutside(rootRef, () => {
    if (!isOpen) return;
    closeSelect();
  });

  const handleSelect = (type: string) => {
    onCommit(type);
    closeSelect();
  };

  return (
      <div ref={rootRef} className={clsx(s.root, isOpen && s.focused)}>
        <Input
            className={s.input}
            id={name}
            name={name}
            type="text"
            label={label}
            placeholder={placeholder}
            value={value ?? ""}
            error={visibleError}
            hideErrorMessage={isOpen}
            disabled={disabled}
            readOnly={readonly}
            onMouseDown={(e) => {
              e.preventDefault();
              toggleOpen();
            }}
            rightSlot={
              <button
                  type="button"
                  className={s.button}
                  disabled={disabled}
                  aria-label={isOpen ? "Close company type list" : "Open company type list"}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    toggleOpen();
                  }}
              >
                <ChevronIcon className={clsx(s.chevronIcon, isOpen && s.chevronOpen)} />
              </button>
            }
        />

        <div className={clsx(s.listWrapper, isOpen && s.listWrapperVisible)}>
          <ul className={s.list} role="listbox">
            {COMPANY_TYPE.map((type) => {
              const selected = type === value;

              return (
                  <li
                      key={type}
                      className={s.item}
                      role="option"
                      tabIndex={-1}
                      aria-selected={selected}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelect(type);
                      }}
                  >
                    <span>{type}</span>
                    {selected && <CheckIcon className={s.checkIcon} />}
                  </li>
              );
            })}
          </ul>
        </div>
      </div>
  );
};