import type { TSocialAccountFormValues } from "../types/account-setup.types";

const TOP_COUNTRIES = 5;

const makeEmptyCountries = () =>
  Array.from({ length: TOP_COUNTRIES }, () => ({
    country: null as string | null,
    percentage: null as number | null,
  }));

export const getDefaultValues = (
  account?: TSocialAccountFormValues,
): TSocialAccountFormValues => {
  const base: TSocialAccountFormValues = {
    username: "",
    profileLink: "",
    followers: null,
    logoUrl: "",
    profileCategory: "community",
    musicGenres: [],
    categories: [],
    creatorCategories: [],
    price: null,
    currency: "EUR",
    countries: makeEmptyCountries(), // 5 empty slots
  };

  if (!account) {
    // console.log('Create mode or no account provided');
    return base;
  }

  // console.log('Edit mode with account:', account);

  return {
    ...base,
    ...account,
  };
};
