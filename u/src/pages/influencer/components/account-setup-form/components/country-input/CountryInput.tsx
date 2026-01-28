import "./_country-input.scss";
import { useMemo, useRef, useState } from "react";
import { useClickOutside } from "../../../../../../hooks/global/useClickOutside";
import { Controller, useFormContext } from "react-hook-form";
import { COUNTRY_LIST } from "./data/countries.data";

interface Props {
  placeholder: string;
  index: number;
  isError?: boolean;
}

/*
TODO: add validation for country selection
  {
    shouldValidate: true,
    shouldDirty: true,
  }
*/

export const CountryInput: React.FC<Props> = ({
  placeholder,
  index,
  isError,
}: Props) => {
  const { control } = useFormContext();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isSelectingRef = useRef(false);
  const [searchValue, setSearchValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useClickOutside(dropdownRef, () => {
    if (isFocused) setIsFocused(false);
  });

  return (
    <Controller
      control={control}
      name={`countries.${index}.country`}
      render={({ field }) => {
        const filteredCountries = useMemo(() => {
          if (!searchValue) return [];
          return COUNTRY_LIST.filter((c) =>
            c.name.toLowerCase().includes(searchValue.toLowerCase()),
          );
        }, [searchValue]);

        const showDropdown = isFocused && filteredCountries.length > 0;

        const displayValue = isFocused ? searchValue : (field.value ?? "");

        return (
          <div
            ref={dropdownRef}
            className={`country-input ${isFocused ? "country-input--focused" : ""}`}>
            <input
              type="text"
              className="country-input__input"
              placeholder={placeholder}
              value={displayValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setIsFocused(true);
              }}
              onFocus={() => {
                setSearchValue(field.value ?? "");
                setIsFocused(true);
              }}
              onBlur={() => {
                setIsFocused(false);

                if (isSelectingRef.current) {
                  isSelectingRef.current = false;
                  return;
                }

                if (!searchValue.trim()) {
                  field.onChange(null);
                }
              }}
            />

            <div
              className={`country-input__list-wrapper ${showDropdown ? "country-input__list-wrapper--visible" : ""}`}>
              <ul className={`country-input__list`}>
                {filteredCountries.map((country) => (
                  <li
                    key={country.code}
                    className="country-input__item"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      isSelectingRef.current = true;
                      field.onChange(country.name);
                      setSearchValue("");
                      setTimeout(() => setIsFocused(false), 120);
                    }}>
                    {country.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      }}
    />
  );
};
