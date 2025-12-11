import $api from "../../../api";

// get multi promo accounts  //

export const getMultiPromoAccounts = async (socialMedia: string) => {
  try {
    const response = await $api.get(
      `/multi-promo/accounts/${socialMedia},spotify`
    );

    return response;
  } catch (error) {
    console.error("Error fetching multi promo accounts:", error);
    throw error;
  }
};
