import axios, { AxiosError } from "axios";
import { handleApiError } from "./error.api.ts";
import { tokenStorage } from "../contexts/AuthContext.tsx";
import {refreshAccessToken} from "@/api/refresh.manager.ts";

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
    setAccessToken: (token: string | null) => void,
    logout: () => void,
) => {
    const isAuthRoute = (url?: string) =>
        !!url && (url.includes("/auth/login") || url.includes("/auth/refresh"));

    const reqId = $api.interceptors.request.use((config) => {
        const token = tokenStorage.get();
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    });

    const resId = $api.interceptors.response.use(
        (res) => res,
        async (error: AxiosError) => {
            const originalRequest: any = error.config;

            if (!error.response) {
                handleApiError(error);
                return Promise.reject(error);
            }

            if (isAuthRoute(originalRequest?.url)) {
                return Promise.reject(error);
            }

            const shouldTryRefresh =
                error.response.status === 401 && !originalRequest?._retry;

            if (!shouldTryRefresh) {
                handleApiError(error);
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            try {
                const token = await refreshAccessToken(setAccessToken);
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return $api(originalRequest);
            } catch (err) {
                logout();
                return Promise.reject(err);
            }
        },
    );

    return () => {
        $api.interceptors.request.eject(reqId);
        $api.interceptors.response.eject(resId);
    };
};

export default $api;
