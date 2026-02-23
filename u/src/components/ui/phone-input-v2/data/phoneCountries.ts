import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import { getCountries, getCountryCallingCode } from "libphonenumber-js";

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

const rest = getCountries().map((iso2) => {
  const name = countries.getName(iso2, "en") ?? iso2;
  const dialCode = `+${getCountryCallingCode(iso2)}`;
  return { iso2: iso2.toLowerCase(), countryName: name, dialCode };
}).sort((a, b) => a.countryName.localeCompare(b.countryName));

export const ALL_PHONE_COUNTRIES: PhoneCountry[] = [...rest];