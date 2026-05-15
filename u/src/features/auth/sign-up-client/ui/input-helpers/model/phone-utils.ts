import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
} from "libphonenumber-js";

import { PREFERRED_COUNTRY_BY_DIAL_CODE } from "@/features/auth/sign-up-client/ui/input-helpers/model/phone-countries.ts";

countries.registerLocale(enLocale);

export type PhoneCountry = {
  iso2: string;
  countryName: string;
  dialCode: string;
};

export const UN_COUNTRY: PhoneCountry = {
  iso2: "un",
  countryName: "Not selected",
  dialCode: "",
};

export const ALL_PHONE_COUNTRIES: PhoneCountry[] = getCountries()
    .map((iso2) => {
      const code = iso2.toLowerCase();
      const name = countries.getName(iso2, "en") ?? iso2;
      const dialCode = `+${getCountryCallingCode(iso2)}`;

      return {
        iso2: code,
        countryName: name,
        dialCode,
      };
    })
    .sort((a, b) => a.countryName.localeCompare(b.countryName));
console.log("ALL_PHONE_COUNTRIES:", ALL_PHONE_COUNTRIES.length, ALL_PHONE_COUNTRIES.slice(0, 5));
export const DEFAULT_CODE =
    ALL_PHONE_COUNTRIES.find((c) => c.iso2 === "gb") ?? UN_COUNTRY;

const COUNTRY_BY_ISO2 = new Map(
    ALL_PHONE_COUNTRIES.map((c) => [c.iso2.toLowerCase(), c]),
);

export const isValidFullPhone = (raw?: string) => {
  if (!raw) return false;

  const pn = parsePhoneNumberFromString(raw);
  return !!pn?.isValid();
};

export const sanitizePhone = (raw: string) => {
  let cleaned = raw.replace(/[^\d+]/g, "");

  if (cleaned.includes("+")) {
    cleaned = `+${cleaned.replace(/\+/g, "")}`;
  }

  return cleaned;
};

export const getDialCodeFromValue = (raw: string) => {
  const v = sanitizePhone(raw);

  if (!v.startsWith("+")) return "";

  const match = ALL_PHONE_COUNTRIES
      .filter((c) => c.dialCode && v.startsWith(c.dialCode))
      .sort((a, b) => b.dialCode.length - a.dialCode.length)[0];

  return match?.dialCode ?? "";
};

export const getTailDigitsByDialCode = (value: string, dialCode: string) => {
  const v = sanitizePhone(value);

  if (!v.startsWith("+")) {
    return v.replace(/\D/g, "");
  }

  if (!dialCode || !v.startsWith(dialCode)) {
    return v.replace(/\D/g, "").slice(1);
  }

  return v.slice(dialCode.length).replace(/\D/g, "");
};

export const pickCountryByPhone = (
    raw: string,
    fallback: PhoneCountry = DEFAULT_CODE,
): PhoneCountry => {
  const v = sanitizePhone(raw);

  if (!v.startsWith("+")) {
    return fallback;
  }

  const pn = parsePhoneNumberFromString(v);
  const iso2 = pn?.country?.toLowerCase();

  if (iso2) {
    return COUNTRY_BY_ISO2.get(iso2) ?? fallback;
  }

  const dialCode = getDialCodeFromValue(v);

  if (!dialCode) {
    return fallback;
  }

  if (fallback.dialCode === dialCode) {
    return fallback;
  }

  const preferredIso2 = PREFERRED_COUNTRY_BY_DIAL_CODE.get(dialCode);

  if (preferredIso2) {
    return COUNTRY_BY_ISO2.get(preferredIso2) ?? fallback;
  }

  return (
      ALL_PHONE_COUNTRIES.find((country) => country.dialCode === dialCode) ??
      fallback
  );
};