import $api from "../../../api";

export const getMultiPromoAccounts = async (socialMedia: string) => {
  try {
    const response = await $api.get(`/multi-promo/accounts/${socialMedia}`);

    return response;
  } catch (error) {
    console.error("Error fetching offers:", error);
    throw error;
  }
};
