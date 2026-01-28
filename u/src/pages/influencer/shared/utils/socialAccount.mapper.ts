import type { CountryItem, SocialAccountDraft, TSocialAccountShort } from "@/types/user/influencer.types";

const TOP_COUNTRIES = 5;

// default placeholder logo URL
export const PLACEHOLDER_LOGO_URL =
  "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

export const normalizeLogoUrlForApi = (logoUrl: unknown) => {
  const v = typeof logoUrl === "string" ? logoUrl.trim() : "";
  return v.length ? v : PLACEHOLDER_LOGO_URL;
};

// countries normalize for form -- ensure fixed length array with valid entries
export const normalizeCountriesForForm = (countries: CountryItem[]): CountryItem[] => {
  const arr = Array.isArray(countries) ? countries : [];

  const normalized = arr.slice(0, TOP_COUNTRIES).map((c: CountryItem) => ({
    country: typeof c?.country === "string" && c.country.trim() ? c.country : null,
    percentage: typeof c?.percentage === "number" ? c.percentage : null,
  }));

  while (normalized.length < TOP_COUNTRIES) {
    normalized.push({ country: null, percentage: null });
  }

  return normalized;
};

// clean countries for API -- remove invalid entries
export const cleanCountriesForApi = (countries: CountryItem[]) => {
  const arr = Array.isArray(countries) ? countries : [];

  return arr
    .map((c: CountryItem) => ({
      country: typeof c?.country === "string" ? c.country.trim() : "",
      percentage: typeof c?.percentage === "number" ? c.percentage : NaN,
    }))
    .filter((c) => c.country.length > 0 && Number.isFinite(c.percentage))
    .map((c) => ({
      country: c.country,
      percentage: Math.max(0, Math.min(100, c.percentage)),
    }));
};

// account normalize for form
export const normalizeAccountForForm = (a: SocialAccountDraft): SocialAccountDraft => ({
  ...a,
  currency: a.currency ?? "EUR",
  // for the form we allow an empty string so the UI can show "no photo"
  logoUrl: typeof a.logoUrl === "string" ? a.logoUrl : "",
  countries: normalizeCountriesForForm(a.countries),
  musicGenres: Array.isArray(a.musicGenres) ? a.musicGenres : [],
  categories: Array.isArray(a.categories) ? a.categories : [],
  creatorCategories: Array.isArray(a.creatorCategories) ? a.creatorCategories : [],
});

// account normalize for API
export const normalizeAccountForApi = (a: SocialAccountDraft): SocialAccountDraft => ({
  ...a,
  currency: a.currency ?? "EUR",
  logoUrl: normalizeLogoUrlForApi(a.logoUrl),
  countries: cleanCountriesForApi(a.countries),
});

// profile short list updates
export const upsertShortInList = (list: TSocialAccountShort[], short: TSocialAccountShort): TSocialAccountShort[] => {
  const idx = list.findIndex((x) => x.accountId === short.accountId);
  if (idx === -1) return [...list, short];
  const next = list.slice();
  next[idx] = short;
  return next;
};

// profile short list removals
export const removeShortFromList = (list: TSocialAccountShort[], accountId: string): TSocialAccountShort[] =>
  list.filter((x) => x.accountId !== accountId);
