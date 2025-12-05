import { phoneNumbers } from "../../constants/phone-numbers.ts";
import type { PhoneValidationResult } from "../../types/utils/validators.types.ts";

export function validatePhoneNumber(phone: string): PhoneValidationResult {
  const cleaned = phone.replace(/[\s\-()]/g, "");

  if (!/^\+?\d{6,15}$/.test(cleaned)) {
    return { isValid: false };
  }

  const matchedCountry = phoneNumbers.find((country) => {
    const regex = new RegExp(country.pattern);
    return regex.test(cleaned);
  });

  return {
    isValid: !!matchedCountry,
    country: matchedCountry
      ? {
          name: matchedCountry.countryName,
          flag: matchedCountry.countryFlag,
          placeholder: matchedCountry.placeholder,
        }
      : undefined,
  };
}

export const validateLetters = (value: string): boolean => {
  const regex = /^[A-Za-zА-Яа-яЁё]*$/;
  return regex.test(value);
};
