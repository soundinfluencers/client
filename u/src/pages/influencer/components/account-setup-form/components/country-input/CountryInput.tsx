import "./_country-input.scss";
import { useMemo, useRef, useState } from "react";
import { useClickOutside } from "../../../../../../hooks/global/useClickOutside";
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { COUNTRY_LIST } from './data/countries.data';

interface Props {
  placeholder: string;
  index: number;
}

export const CountryInput: React.FC<Props> = ({
  placeholder,
  index,
}: Props) => {
  const { control, setValue } = useFormContext();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isSelectingRef = useRef(false);
  const [searchValue, setSearchValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useClickOutside(dropdownRef, () => {
    if (isFocused) setIsFocused(false);
  });

  const allCountries = useWatch({
    control,
    name: "countries",
  }) as Array<{ country: string | null; percentage: number | null }> | undefined;

  const selectedSet = useMemo(() => {
    const set = new Set<string>();
    (allCountries ?? []).forEach((item, i) => {
      if (i === index) return;
      if (item?.country) set.add(item.country);
    });
    return set;
  }, [allCountries, index]);

  return (
    <Controller
      control={control}
      name={`countries.${index}.country`}
      render={({ field, fieldState }) => {
        const hasError = fieldState.invalid;

        const filteredCountries = useMemo(() => {
          if (!searchValue) return [];
          return COUNTRY_LIST
            .filter(c => c.name.toLowerCase().includes(searchValue.toLowerCase()))
            .filter(c => !selectedSet.has(c.name));
        }, [searchValue, selectedSet]);
        const showDropdown = isFocused && filteredCountries.length > 0;

        const displayValue = isFocused ? searchValue : (field.value ?? "");

        return (
          <div
            ref={dropdownRef}
            className={`country-input ${isFocused ? "country-input--focused" : ""}`}>
            <input
              type="text"
              className={`country-input__input ${hasError ? 'country-input__input--error' : ''}`}
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
                  setValue(`countries.${index}.country`, null, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
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
                      setValue(`countries.${index}.country`, country.name, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      setSearchValue('');
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
