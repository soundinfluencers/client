import {
  type ChangeEvent,
  type FC,
  useEffect,
  useState,
  useMemo,
  useRef,
} from "react";
import "./_input-phone.scss";
import openMenu from "@/assets/icons/chevron-down.svg";
import smallSearch from "@/assets/icons/small-search.svg";
import check from "@/assets/icons/check.svg";
import {
  validateLetters,
  validatePhoneNumber,
} from "../../../../../../utils/validators/validators.ts";
import type { PhoneNumberType } from "../../../../../../types/utils/constants.types.ts";
import { phoneNumbers } from "../../../../../../constants/phone-numbers.ts";
import { useClickOutside } from "../../../../../../hooks/useClickOutside.ts";

export interface InputPhoneProps {
  value: string;
  setValue: (value: string) => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  isError?: boolean;
}

export const InputPhone: FC<InputPhoneProps> = ({
  value,
  setValue,
  isMenuOpen,
  setIsMenuOpen,
  isError,
}: InputPhoneProps) => {
  const [isValid, setIsValid] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedPhoneDetails, setSelectedPhoneDetails] =
    useState<PhoneNumberType>({
      countryName: "UK",
      placeholder: "+44",
      pattern: "xz",
      countryFlag: "🇬🇧",
    });

  useEffect(() => {
    if (!value) {
      setIsValid(true);
      return;
    }

    const handler = setTimeout(() => {
      const valid = validatePhoneNumber(value);
      setIsValid(valid.isValid);
    }, 300);

    return () => clearTimeout(handler);
  }, [value]);

  useClickOutside(dropdownRef, () => {
    if (isMenuOpen) setIsMenuOpen(false);
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const cleanedValue = e?.target?.value?.replace(/[^+\d\s\-()]/g, "") ?? "";
    setValue(cleanedValue);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value ?? "";
    if (validateLetters(val)) {
      setSearchValue(val);
    }
  };

  const filteredPhoneNumbers = useMemo(
    () =>
      phoneNumbers.filter((phone) =>
        phone.countryName.toLowerCase().includes(searchValue.toLowerCase())
      ),
    [searchValue]
  );

  return (
    <div
      ref={dropdownRef}
      className={`input-phone ${
        !isValid || isError ? "input-phone--error" : ""
      }`}>
      <p className="input-phone__title">Phone*</p>

      <div
        className={`input-phone__input-block ${
          isMenuOpen ? "input-phone__input-block--active" : ""
        }`}>
        <div
          className="input-phone__menu-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <p className="input-phone__flag">
            {selectedPhoneDetails.countryFlag}
          </p>
          <img src={openMenu} alt="" className="input-phone__open-menu-btn" />
        </div>
        <input
          className="input-phone__input"
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={selectedPhoneDetails.placeholder}
        />
      </div>

      <div
        className={`input-phone__dropdown ${
          isMenuOpen ? "input-phone__dropdown--visible" : ""
        }`}>
        <div className="input-phone__dropdown-search">
          <img
            src={smallSearch}
            alt=""
            className="input-phone__dropdown-search-icon"
          />
          <input
            className="input-phone__dropdown-search-input"
            placeholder="Search for countries"
            value={searchValue}
            onChange={handleSearchChange}
          />
        </div>

        <div className="input-phone__dropdown-list">
          {filteredPhoneNumbers.map((phone: PhoneNumberType) => (
            <div
              className="input-phone__dropdown-list-item"
              key={phone.countryName}
              onClick={() => setSelectedPhoneDetails(phone)}>
              <div className="input-phone__dropdown-list-item-details">
                <p>{phone.countryFlag ?? phone.placeholder}</p>
                <p className="input-phone__dropdown-list-item-country">
                  {phone.countryName} (
                  {phone.countryFlag ? phone.placeholder : ""})
                </p>
              </div>
              {selectedPhoneDetails.countryName === phone.countryName && (
                <img
                  src={check}
                  alt="checked"
                  className="input-phone__dropdown-list-item-check"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
