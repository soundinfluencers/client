import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { handleApiError } from "./error.api.ts";
import { tokenStorage } from "../contexts/AuthContext.tsx";

const $api = axios.create({
  baseURL: import.meta.env.VITE_SERVER,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export const $auth = axios.create({
  baseURL: import.meta.env.VITE_SERVER,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export const setupInterceptors = (
  setAccessToken: (token: string) => void,
  logout: () => void,
) => {
  let isRefreshing = false;

  type QueueItem = {
    resolve: (token: string) => void;
    reject: (err: unknown) => void;
  };

  let failedQueue: QueueItem[] = [];

  const processQueue = (err: unknown, token?: string) => {
    failedQueue.forEach((p) => (err ? p.reject(err) : p.resolve(token!)));
    failedQueue = [];
  };

  const isAuthRoute = (url?: string) =>
    !!url && (url.includes("/auth/login") || url.includes("/auth/refresh"));

  $api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.get();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  $api.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const originalRequest: any = error.config;

      if (!error.response) {
        handleApiError(error);
        return Promise.reject(error);
      }

      if (isAuthRoute(originalRequest?.url)) {
        handleApiError(error);
        return Promise.reject(error);
      }

      const shouldTryRefresh =
        error.response.status === 401 && !originalRequest?._retry;

      if (!shouldTryRefresh) {
        handleApiError(error);
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return $api(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        const { data } = await $auth.post<{ accessToken: string }>(
          "/auth/refresh",
        );

        setAccessToken(data.accessToken);
        processQueue(null, data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return $api(originalRequest);
      } catch (err) {
        processQueue(err);
        logout();
        handleApiError(err);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    },
  );
};

export default $api;
