import $api from "@/api/api";
import axios from "axios";

export type ThumbSizeTag =
  | "w32h32"
  | "w64h64"
  | "w128h128"
  | "w256h256"
  | "w480h320"
  | "w640h480"
  | "w960h640"
  | "w1024h768"
  | "w2048h1536";

export type FilePreviewRequest = {
  provider: "dropbox";
  pathLower: string;
  fileId: string;
  sizeTag: ThumbSizeTag;
};

export const getFilePreview = async (payload: FilePreviewRequest) => {
  const res = await $api.post("/file/preview", payload, {
    responseType: "blob",
  });

  return res.data as Blob;
};
const apiNoCred = axios.create({
  baseURL: "https://dev-api.soundinfluencers.com",
  withCredentials: false,
});
export const getVideoBlobUrl = async (payload: {
  provider: "dropbox";
  pathLower: string;
}) => {
  const res = await apiNoCred.post("/file/video", payload, {
    responseType: "blob",
  });

  return URL.createObjectURL(res.data);
};
