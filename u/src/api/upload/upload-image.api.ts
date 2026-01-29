import $api from "../api";

export const uploadImageApi = async (imageFile: File): Promise<string> => {
  const formData = new FormData();

  formData.append("file", imageFile);

  const response = await $api.post("/file", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data;
};
