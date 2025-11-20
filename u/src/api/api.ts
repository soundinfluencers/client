import axios, {AxiosError} from 'axios';
import {handleApiError} from "./error.api.ts";
import {tokenStorage} from "../contexts/AuthContext.tsx";

const $api = axios.create({
    baseURL: import.meta.env.VITE_SERVER,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

$api.interceptors.response.use(
    // @ts-ignore
    (response) => response,
    (error: AxiosError) => {
        handleApiError(error);
        return Promise.reject(error);
    }
);

// настройка интерцептора при инициализации приложения
export const setupInterceptors = (setAccessToken: (token: string) => void, logout: () => void) => {
    let isRefreshing = false;
    let failedQueue: Array<any> = [];

    const processQueue = (error: any, token: string | null = null) => {
        failedQueue.forEach(p => (error ? p.reject(error) : p.resolve(token)));
        failedQueue = [];
    };

    $api.interceptors.request.use((config) => {
        const token = tokenStorage.get();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    $api.interceptors.response.use(
        res => res,
        async error => {
            const originalRequest = error.config;
            if (axios.isAxiosError(error) && error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    }).then(token => {
                        originalRequest.headers["Authorization"] = `Bearer ${token}`;
                        return $api(originalRequest);
                    });
                }

                isRefreshing = true;
                try {
                    const { data } = await $api.post<{ accessToken: string }>("/auth/refresh");
                    setAccessToken(data.accessToken);
                    processQueue(null, data.accessToken);
                    originalRequest.headers["Authorization"] = `Bearer ${data.accessToken}`;
                    return $api(originalRequest);
                } catch (err) {
                    processQueue(err, null);
                    logout();
                    return Promise.reject(err);
                } finally {
                    isRefreshing = false;
                }
            }
            return Promise.reject(error);
        }
    );
};

export default $api;