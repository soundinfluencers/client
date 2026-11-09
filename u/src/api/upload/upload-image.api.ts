import $api from "../api";
import type { AxiosRequestConfig } from 'axios';

export const uploadImageApi = async (imageFile: File, options?: AxiosRequestConfig & { isCurrentRequest?: () => boolean; silentReadError?: boolean }): Promise<string> => {
  const formData = new FormData();

  formData.append("file", imageFile);

  const response = await $api.post("/file", formData, {
    ...options,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data;
};
