import $api from "../../../api";

export const getPublishedOffers = async (platform: string, genre: string) => {
  try {
    const encodedGenre = encodeURIComponent(genre);
    const response = await $api.get(
      `/offers/get/published/${platform}/${encodedGenre}`
    );
    console.log(response.data);
    return response.data.offers;
  } catch (error) {
    console.error("Error fetching offers:", error);
    throw error;
  }
};
