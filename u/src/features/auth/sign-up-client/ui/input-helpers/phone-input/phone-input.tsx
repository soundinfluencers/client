import React, { useCallback, useMemo, useRef, useState } from "react";



import clsx from "clsx";

import "flag-icons/css/flag-icons.min.css";
import s from './phone-input.module.scss';
import {
  CountryCodeList,
  type CountryCodeListRef
} from "@/features/auth/sign-up-client/ui/input-helpers/country-code-list/country-code-list.tsx";
import {
  ALL_PHONE_COUNTRIES,
  DEFAULT_CODE, getDialCodeFromValue, getTailDigitsByDialCode, isValidFullPhone,
  type PhoneCountry,
  pickCountryByPhone, sanitizePhone
} from "@/features/auth/sign-up-client/ui/input-helpers/model/phone-utils.ts";
import {useClickOutside} from "@/shared/lib/hooks/useClickOutside.ts";
import {Input} from "@/features/auth/sign-up-client/ui/input/input.tsx";
import {
  CountryCodeSelect
} from "@/features/auth/sign-up-client/ui/input-helpers/country-code-select/country-code-select.tsx";

interface PhoneInputProps {
  value: string;
  name: string;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;

  onChange?: (value: string) => void;
  onBlur?: () => void;
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      value,
      name,
      label,
      placeholder,
      disabled = false,
      error,
      onChange,
      onBlur,
    },
    ref,
  ) => {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const phoneInputRef = useRef<HTMLInputElement | null>(null);
    const countryCodeListRef = useRef<CountryCodeListRef | null>(null);

    const [manualCountry, setManualCountry] = useState<PhoneCountry | null>(null);
    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const setInputRefs = useCallback(
      (node: HTMLInputElement | null) => {
        phoneInputRef.current = node;

        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    const resolvedCountry = useMemo(() => {
      return pickCountryByPhone(value, manualCountry ?? DEFAULT_CODE);
    }, [value, manualCountry]);

    const closeSelect = useCallback(() => {
      setIsOpen(false);
      setSearch("");
    }, []);

    const handleToggleSelect = useCallback(() => {
      if (disabled) return;

      setIsOpen((prev) => {
        const next = !prev;

        requestAnimationFrame(() => {
          if (next) {
            countryCodeListRef.current?.focusSearch();
          } else {
            phoneInputRef.current?.focus();
          }
        });

        return next;
      });
    }, [disabled]);

    const handleSelectCountry = useCallback((country: PhoneCountry) => {
      if (country.iso2 === resolvedCountry.iso2) {
        closeSelect();

        requestAnimationFrame(() => {
          phoneInputRef.current?.focus();
        });

        return;
      }

      const cleaned = sanitizePhone(value);

      const tail = isValidFullPhone(cleaned)
        ? ""
        : getTailDigitsByDialCode(cleaned, getDialCodeFromValue(cleaned));

      const nextValue = country.dialCode ? `${country.dialCode}${tail}` : "";

      setManualCountry(country);
      closeSelect();

      onChange?.(nextValue);

      requestAnimationFrame(() => {
        phoneInputRef.current?.focus();
      });
    }, [closeSelect, onChange, resolvedCountry.iso2, value]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const cleaned = sanitizePhone(e.target.value);

      onChange?.(cleaned);
    }, [onChange])

    useClickOutside(rootRef, closeSelect);

    const filteredCountryCode = useMemo(() => {
      const q = search.trim().toLowerCase();

      if (!q) return ALL_PHONE_COUNTRIES;

      return ALL_PHONE_COUNTRIES.filter((c) =>
        c.countryName.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.iso2.includes(q),
      );
    }, [search]);

    const visibleError = isOpen ? undefined : error;

    return (
      <div
        ref={rootRef}
        className={clsx(s.root, isOpen && s.focused)}
      >
        <Input
          ref={setInputRefs}
          className={s.input}
          name={name}
          id={name}
          type={'tel'}
          label={label}
          placeholder={placeholder ?? "Enter phone number"}
          value={value}
          error={visibleError}
          hideErrorMessage={isOpen}
          disabled={disabled}
          onChange={handleInputChange}
          onMouseDown={() => {
            if (isOpen) {
              closeSelect();
            }
          }}
          onBlur={onBlur}
          leftSlot={
            <CountryCodeSelect
              iso2={resolvedCountry.iso2}
              onToggle={handleToggleSelect}
              isOpen={isOpen}
              disabled={disabled}
            />
          }
        />

        <CountryCodeList
          ref={countryCodeListRef}
          searchInputId={`${name}-country-search`}
          selectedCountry={resolvedCountry}
          onSelectCountry={handleSelectCountry}
          countryCodes={filteredCountryCode}
          isOpen={isOpen}
          searchValue={search}
          setSearchValue={setSearch}
        />
      </div>
    );
  },
);

PhoneInput.displayName = 'PhoneInput';
