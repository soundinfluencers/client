import $api from "../../../api";

export const getFilters = async () => {
  try {
    const response = await $api.get(`/profile/filters`);
    console.log(response, "filters");
    return response.data;
  } catch (error) {
    console.error("Error fetching offers:", error);
    throw error;
  }
};
