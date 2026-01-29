import $api from "../../api";

export const getPublishedOffers = async (platform: string, genre: string) => {
  try {
    const encodedGenre = encodeURIComponent(genre);
    const response = await $api.get(
      `/offers/published/${platform}/${encodedGenre}`,
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching offers:", error);
    throw error;
  }
};
