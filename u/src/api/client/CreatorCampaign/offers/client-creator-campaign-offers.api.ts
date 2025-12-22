import $api from "../../../api";

// get offers  //

export const getPublishedOffers = async (platform: string, genre: string) => {
  try {
    const encodedGenre = encodeURIComponent(genre);
    const response = await $api.get(
      `/offers/get/published/${platform}/${encodedGenre}`
    );
    return response.data.data.offers;
  } catch (error) {
    console.error("Error fetching offers:", error);
    throw error;
  }
};
