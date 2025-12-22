import './_country-input.scss';
import { useMemo, useRef, useState } from "react";
import type { UseFormRegister, UseFormSetValue } from 'react-hook-form';
import type { IAccountFormValues } from '../../../../../../types/user/influencer.types';
import { COUNTRY_LIST } from '../../../../../../constants/influencer/country-list.data';
import { useClickOutside } from '../../../../../../hooks/useClickOutside';

interface Props {
  placeholder: string;
  register: UseFormRegister<IAccountFormValues>;
  setValue?: UseFormSetValue<IAccountFormValues>;
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
  register,
  setValue,
  index,
  isError,
}: Props) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchValue, setSearchValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useClickOutside(dropdownRef, () => {
    if (isFocused) setIsFocused(false);
  });

  const filteredCountries = useMemo(() => {
    if (!searchValue) return [];

    return COUNTRY_LIST.filter((country) =>
      country.name.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue]);

  const isDropdownVisible = isFocused && filteredCountries.length > 0 && searchValue;

  return (
    <div ref={dropdownRef} className={`country-input ${isFocused ? 'country-input--focused' : ''}`}>
      <input
        type="text"
        className="country-input__input"
        placeholder={placeholder}
        {...register(`countries.${index}.country`, {
          setValueAs: (value: string) => value.trim(),
        })}
        onChange={(e) => setSearchValue(e.target.value.toLowerCase())}
        onFocus={() => setIsFocused(true)}
      />

      <div className={`country-input__list-wrapper ${isDropdownVisible ? 'country-input__list-wrapper--visible' : ''}`}>
        <ul className={`country-input__list`}>
          {filteredCountries.map((country) => (
            <li
              key={country.code}
              className="country-input__item"
              onClick={() => {
                setValue?.(`countries.${index}.country`, country.name);
                setSearchValue('');
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
};