import './_country-autocomplete.scss';
import React, { useMemo, useRef, useState } from "react";
import { useClickOutside } from "@/hooks/global/useClickOutside.ts";
import {
  COUNTRY_LIST
} from "@/constants/countries.data.ts";
import type { FieldError } from "react-hook-form";

interface Props {
  value: string;
  name?: string;
  placeholder?: string;
  label?: string;
  error?: FieldError;
  size?: 'small' | 'large';

  excludeCountries?: Set<string>;
  onCommit: (name: string | null) => void;
  onInputChange?: (raw: string) => void;
}

export const CountryAutocomplete: React.FC<Props> = (
  {
    value,
    name,
    placeholder,
    label,
    error,
    excludeCountries,
    onCommit,
    onInputChange,
    size,
  }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isSelectingRef = useRef(false);

  const [searchValue, setSearchValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useClickOutside(dropdownRef, () => {
    if (!isFocused) return;
    setIsFocused(false);
  });

  const filteredCountries = useMemo(() => {
    const q = searchValue.trim().toLowerCase();
    if (!q) return [];
    return COUNTRY_LIST
    .filter((c) => c.name.toLowerCase().includes(q))
    .filter((c) => !(excludeCountries?.has(c.name)));
  }, [searchValue, excludeCountries]);

  const showDropdown = isFocused && filteredCountries.length > 0;
  const displayValue = isFocused ? searchValue : (value ?? "");

  const findExactCountry = (raw: string) => {
    const q = raw.trim().toLowerCase();
    if (!q) return null;
    return COUNTRY_LIST.find((c) => c.name.trim().toLowerCase() === q) ?? null;
  };

  return (
    <div ref={dropdownRef} className={`country-input ${isFocused ? "country-input--focused" : ""}`}>
      {label && <label htmlFor={name} className={`country-input__label ${error ? "country-input__label--error" : ""}`}>{label}</label>}
      <input
        id={name}
        name={name}
        type="text"
        className={`country-input__input ${size === 'small' ? "country-input__input--small" : ""} ${error ? "country-input__input--error" : ""}`}
        placeholder={placeholder}
        value={displayValue}
        onChange={(e) => {
          const raw = e.target.value;
          setSearchValue(raw);
          setIsFocused(true);
          onInputChange?.(raw);
        }}
        onFocus={() => {
          setSearchValue(value ?? "");
          setIsFocused(true);
        }}
        onBlur={() => {
          setIsFocused(false);

          if (isSelectingRef.current) {
            isSelectingRef.current = false;
            return;
          }

          const typed = searchValue.trim();

          if (!typed) {
            onCommit(null);
            setSearchValue("");
            return;
          }

          const exact = findExactCountry(typed);

          if (exact && !(excludeCountries?.has(exact.name))) {
            onCommit(exact.name);
            setSearchValue("");
            return;
          }

          onCommit(null);
          setSearchValue("");
        }}
      />

      {error && <p className={'country-input__error-message'}>{error?.message}</p>}

      <div className={`country-input__list-wrapper ${showDropdown ? "country-input__list-wrapper--visible" : ""}`}>
        <ul className="country-input__list">
          {filteredCountries.map((country) => (
            <li
              key={country.code}
              className="country-input__item"
              onMouseDown={(e) => {
                e.preventDefault();
                isSelectingRef.current = true;

                onCommit(country.name);
                setSearchValue("");
                setTimeout(() => setIsFocused(false), 120);
              }}
            >
              {country.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}