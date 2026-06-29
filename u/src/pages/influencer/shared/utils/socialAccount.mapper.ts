import type { CountryItem, SocialAccountDraft, TSocialAccountShort } from "@/types/user/influencer.types";
import { THEME_TOPICS } from "@/pages/influencer/components/account-setup-form/components/checkbox-button-list/data/categories.data.ts";
import { CONTENT_FOCUS_OPTIONS } from "@/pages/influencer/components/account-setup-form/components/checkbox-button-list/data/creator-categories.data.ts";
import {
  MUSIC_GENRES_COMMUNITY,
  MUSIC_GENRES_CREATOR,
} from "@/pages/influencer/components/account-setup-form/components/checkbox-button-list/data/music-genres.data.ts";
import {
  mapSelectedTreeToValues,
  mapValuesToSelectedTree,
} from "@/pages/influencer/components/account-setup-form/components/checkbox-button-list/utils/tree-options.helpers.ts";

const TOP_COUNTRIES = 5;

type SocialAccountWithLegacyGenres = SocialAccountDraft & Partial<{
  categories: string[];
  creatorCategories: string[];
  initialPrice: number | null;
}>;

const getArray = (value: unknown): string[] => {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : [];
};

// default placeholder logo URL
export const PLACEHOLDER_LOGO_URL =
  "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

export const normalizeLogoUrlForApi = (logoUrl: unknown) => {
  const v = typeof logoUrl === "string" ? logoUrl.trim() : "";
  return v.length ? v : '';
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
export const normalizeAccountForForm = (a: SocialAccountDraft): SocialAccountDraft => {
  const source = a as SocialAccountWithLegacyGenres;

  return {
    ...a,
    currency: a.currency ?? "EUR",
    price: typeof a.price === "number"
      ? a.price
      : typeof source.initialPrice === "number"
        ? source.initialPrice
        : null,
    // for the form we allow an empty string so the UI can show "no photo"
    logoUrl: typeof a.logoUrl === "string" ? a.logoUrl : "",
    countries: normalizeCountriesForForm(a.countries),
    communityMusicGenres: mapValuesToSelectedTree({
      values: getArray(a.communityMusicGenres),
      options: MUSIC_GENRES_COMMUNITY,
    }),
    communityThemeTopics: mapValuesToSelectedTree({
      values: getArray(a.communityThemeTopics ?? source.categories),
      options: THEME_TOPICS,
    }),
    creatorMusicGenres: mapValuesToSelectedTree({
      values: getArray(a.creatorMusicGenres),
      options: MUSIC_GENRES_CREATOR,
    }),
    creatorContentFocus: mapValuesToSelectedTree({
      values: getArray(a.creatorContentFocus ?? source.creatorCategories),
      options: CONTENT_FOCUS_OPTIONS,
    }),
  };
};

// account normalize for API
export const normalizeAccountForApi = (a: SocialAccountDraft): SocialAccountDraft => {
  const account: SocialAccountWithLegacyGenres = { ...a };
  delete account.musicGenres;
  delete account.categories;
  delete account.creatorCategories;
  delete account.initialPrice;

  if (a.profileCategory === 'community') {
    return {
      ...account,
      currency: a.currency ?? "EUR",
      logoUrl: normalizeLogoUrlForApi(a.logoUrl),
      countries: cleanCountriesForApi(a.countries),
      communityMusicGenres: mapSelectedTreeToValues({
        selectedValues: a.communityMusicGenres,
        options: MUSIC_GENRES_COMMUNITY,
      }),
      communityThemeTopics: mapSelectedTreeToValues({
        selectedValues: a.communityThemeTopics,
        options: THEME_TOPICS,
      }),
      creatorMusicGenres: undefined,
      creatorContentFocus: undefined,
    }
  }

  return {
    ...account,
    currency: a.currency ?? "EUR",
    logoUrl: normalizeLogoUrlForApi(a.logoUrl),
    countries: cleanCountriesForApi(a.countries),
    communityMusicGenres: undefined,
    communityThemeTopics: undefined,
    creatorMusicGenres: mapSelectedTreeToValues({
      selectedValues: a.creatorMusicGenres,
      options: MUSIC_GENRES_CREATOR,
    }),
    creatorContentFocus: mapSelectedTreeToValues({
      selectedValues: a.creatorContentFocus,
      options: CONTENT_FOCUS_OPTIONS,
    }),
  }
};

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
