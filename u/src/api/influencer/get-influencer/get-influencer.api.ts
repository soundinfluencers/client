import $api from "../../api.ts";

// getting INFLUENCER user //

export const getInfluencer = async (
  access: string,
  id: string
): Promise<any> => {
  try {
    const response = await $api.get(`/auth/influencer/${id}`, {
      headers: {
        Authorization: `Bearer ${access}`,
      },
    });

    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching user:", error);
    console.error("Response status:", error.response?.status);
    console.error("Response data:", error.response?.data);
    throw error;
  }
};
