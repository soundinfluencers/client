import type { ISocialAccountFormValues } from "../types/account-setup.types";

export const getDefaultValues = (
  mode: "edit" | "create",
  account?: ISocialAccountFormValues
): ISocialAccountFormValues => {
  if (mode === "create" || !account) {
    return {
      username: "",
      profileLink: "",
      followers: null,
      logoUrl: "",
      profileCategory: "community",
      musicGenres: [],
      categories: [],
      creatorCategories: [],
      countries: [],
      price: null,
    };
  }

  return {
    accountId: account.accountId,
    username: account.username,
    profileLink: account.profileLink,
    followers: account.followers ?? null,
    logoUrl: account.logoUrl,
    profileCategory: account.profileCategory,
    price: account.price ?? null,
    musicGenres: account.musicGenres ?? [],
    creatorCategories: account.creatorCategories ?? [],
    categories: account.categories ?? [],
    countries: account.countries ?? [],
  };
};
