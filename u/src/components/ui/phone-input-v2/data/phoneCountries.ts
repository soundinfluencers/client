import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
} from "libphonenumber-js";

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
  const name = countries.getName(iso2, "en") ?? iso2;
  const dialCode = `+${getCountryCallingCode(iso2)}`;
  return { iso2: iso2.toLowerCase(), countryName: name, dialCode };
})
.sort((a, b) => a.countryName.localeCompare(b.countryName));

const COUNTRY_BY_ISO2 = new Map(
  ALL_PHONE_COUNTRIES.map((c) => [c.iso2.toLowerCase(), c]),
);

export const sanitizePhone = (raw: string) => {
  let cleaned = raw.replace(/[^\d+]/g, "");
  if (cleaned.includes("+")) cleaned = "+" + cleaned.replace(/\+/g, "");
  return cleaned;
};

// It's better to consider the 'tail' relative to a specific dialCode, rather than a regex of 1..4 digits
export const getTailDigitsByDialCode = (value: string, dialCode: string) => {
  const v = sanitizePhone(value);

  // if not starts with "+" — just digits
  if (!v.startsWith("+")) return v.replace(/\D/g, "");

  // if starts with "+" but not with dialCode — remove non-digits and trim the first one (the "+")
  if (!dialCode || !v.startsWith(dialCode)) {
    return v.replace(/\D/g, "").slice(1);
  }

  return v.slice(dialCode.length).replace(/\D/g, "");
};

export const pickCountryByPhone = (
  raw: string,
  current?: PhoneCountry,
): PhoneCountry => {
  const v = sanitizePhone(raw);
  if (!v.startsWith("+")) return current ?? UN_COUNTRY;

  const pn = parsePhoneNumberFromString(v);

  const iso2 = pn?.country?.toLowerCase();
  if (iso2) {
    const detected = COUNTRY_BY_ISO2.get(iso2);

    if (current && detected && current.dialCode === detected.dialCode) {
      return current;
    }

    return detected ?? current ?? UN_COUNTRY;
  }

  return current ?? UN_COUNTRY;
};
