import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useController, useFormContext } from "react-hook-form";
import { useClickOutside } from "@/hooks/global/useClickOutside.ts";

import openMenu from "@/assets/icons/chevron-down.svg";
import searchIcon from "@/assets/icons/small-search.svg";
import check from "@/assets/icons/check.svg";
import "flag-icons/css/flag-icons.min.css";

import {
  type PhoneCountry,
  UN_COUNTRY,
  ALL_PHONE_COUNTRIES, getTailDigitsByDialCode, sanitizePhone, pickCountryByPhone,
} from "@components/ui/phone-input-v2/data/phoneCountries.ts";
import { hasFlag } from "@components/ui/phone-input-v2/utils/hasFlag.ts";

import "./_phone-input-v2.scss";
import { useVirtualizer } from "@tanstack/react-virtual";

interface PhoneInputProps {
  name: string;
  placeholder?: string;
  label?: string;
}

export const PhoneInputV2: React.FC<PhoneInputProps> = ({ name, label, placeholder }) => {
  const { control, setValue, clearErrors } = useFormContext();
  const { field, fieldState } = useController({ control, name });

  const phoneInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listParentRef = useRef<HTMLDivElement>(null);

  const [selectedCountry, setSelectedCountry] = useState<PhoneCountry>(UN_COUNTRY);
  const [search, setSearch] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const value = (field.value ?? "") as string;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ALL_PHONE_COUNTRIES;
    return ALL_PHONE_COUNTRIES.filter((c) =>
      c.countryName.toLowerCase().includes(q) ||
      c.dialCode.includes(q) ||
      c.iso2.includes(q),
    );
  }, [search]);

  const rowVirtualizer = useVirtualizer({
    count: isMenuOpen ? filtered.length : 0,
    getScrollElement: () => listParentRef.current,
    estimateSize: () => 48,
    overscan: 8,
  });

  const closeMenu = useCallback(() => {
    setIsMenuOpen((open) => {
      if (!open) return open;
      setSearch("");
      return false;
    });
  }, []);

  useClickOutside(dropdownRef, closeMenu);

  useEffect(() => {
    if (isMenuOpen) return;

    const next = pickCountryByPhone(value, selectedCountry);
    setSelectedCountry((prev) => (prev.iso2 === next.iso2 ? prev : next));
  }, [value, isMenuOpen, selectedCountry]);

  const handleSelectCountry = useCallback((c: PhoneCountry) => {
    const tail = getTailDigitsByDialCode(value, selectedCountry.dialCode);
    const nextValue = c.dialCode ? `${c.dialCode}${tail}` : "";

    setSelectedCountry(c);
    setSearch("");
    setIsMenuOpen(false);

    setValue(name, nextValue, {
      shouldDirty: true,
      shouldTouch: false,
      shouldValidate: false,
    });

    clearErrors(name);

    searchInputRef.current?.blur();
    setTimeout(() => phoneInputRef.current?.focus(), 0);
  }, [value, selectedCountry.dialCode, setValue, name, clearErrors]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = sanitizePhone(e.target.value);

    field.onChange(cleaned);

    if (fieldState.error) clearErrors(name);
  };

  const showError = !isMenuOpen && !!fieldState.error;

  return (
    <div
      ref={dropdownRef}
      className={`phone-input-v2 ${isMenuOpen ? "phone-input-v2--open" : ""}`}
    >
      {label && (
        <label
          htmlFor={name}
          className={`phone-input-v2__label ${showError ? "phone-input-v2__label--error" : ""}`}
        >
          {label}
        </label>
      )}

      <div className="phone-input-v2__wrapper">
        <button
          type="button"
          className="phone-input-v2__country-code-selector"
          onMouseDown={(e) => {
            e.preventDefault();

            setIsMenuOpen((prev) => {
              const next = !prev;

              setTimeout(() => {
                if (next) searchInputRef.current?.focus();
                else phoneInputRef.current?.focus();
              }, 0);

              return next;
            });
          }}
        >
          <span className="phone-input-v2__flag">
            <CountryFlag iso2={selectedCountry.iso2}/>
          </span>

          <img
            className={`phone-input-v2__country-code-selector-icon ${
              isMenuOpen ? "phone-input-v2__country-code-selector-icon--open" : ""
            }`}
            src={openMenu}
            alt=""
            aria-hidden
          />
        </button>

        <input
          ref={phoneInputRef}
          id={name}
          name={name}
          className={`phone-input-v2__input ${
            isMenuOpen ? "phone-input-v2__input--open" : ""
          } ${!isMenuOpen && fieldState.error ? "phone-input-v2__input--error" : ""}`}
          type="tel"
          placeholder={placeholder ?? "Enter phone number"}
          value={value}
          onChange={handleInputChange}
          onMouseDown={() => {
            if (isMenuOpen) {
              setIsMenuOpen(false);
              setSearch("");
            }
          }}
          onBlur={field.onBlur}
        />
      </div>

      <p
        className={`phone-input-v2__error-message ${
          fieldState.error && !isMenuOpen ? "phone-input-v2__error-message--show" : ""
        }`}
        aria-live="polite"
      >
        {!isMenuOpen ? fieldState.error?.message : ""}
      </p>

      <div
        className={`phone-input-v2__list-wrapper ${
          isMenuOpen ? "phone-input-v2__list-wrapper--open" : ""
        }`}
      >
        <div className="phone-input-v2__search-wrapper">
          <img
            src={searchIcon}
            alt=""
            className="phone-input-v2__search-icon"
            aria-hidden
            onClick={() => searchInputRef.current?.focus()}
          />
          <input
            ref={searchInputRef}
            className="phone-input-v2__search"
            placeholder="Search for countries"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div ref={listParentRef} className="phone-input-v2__list-viewport">
          <ul
            className="phone-input-v2__list"
            style={{
              height: rowVirtualizer.getTotalSize(),
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const c = filtered[virtualRow.index];

              return (
                <li
                  key={virtualRow.key}
                  className="phone-input-v2__list-item"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectCountry(c);
                  }}
                >
                  <span className="phone-input-v2__flag">
                    <CountryFlag iso2={c.iso2}/>
                  </span>
                  <span className="phone-input-v2__list-item-label">
                    {c.countryName} ({c.dialCode})
                  </span>

                  {selectedCountry.iso2 === c.iso2 && (
                    <img
                      src={check}
                      alt=""
                      className="phone-input-v2__list-item-check"
                      aria-hidden
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export interface CountryFlagProps {
  iso2: string;
  className?: string;
}

export const CountryFlag: React.FC<CountryFlagProps> = memo(({ iso2, className }) => {
  const code = hasFlag(iso2) ? iso2 : "un";
  return <span className={`fi fi-${code} phone-flag ${className ?? ""}`} aria-hidden="true"/>;
});

// export default PhoneInputV2;
