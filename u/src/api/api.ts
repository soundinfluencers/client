import axios, { AxiosError } from "axios";
import { handleApiError } from "./error.api.ts";
import { tokenStorage } from "../contexts/AuthContext.tsx";

const $api = axios.create({
  baseURL: import.meta.env.VITE_SERVER,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

$api.interceptors.response.use(
  // @ts-ignore
  (response) => response,
  (error: AxiosError) => {
    // console.log(error);
    handleApiError(error);
    return Promise.reject(error);
  },
);

// настройка интерцептора при инициализации приложения
export const setupInterceptors = (
  setAccessToken: (token: string) => void,
  logout: () => void,
) => {
  let isRefreshing = false;
  let failedQueue: Array<any> = [];

  const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
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
    (res) => res,
    async (error) => {
      const originalRequest = error.config;

      if (
        axios.isAxiosError(error) &&
        error.response?.status === 401 &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return $api(originalRequest);
          });
        }

        isRefreshing = true;
        try {
          const { data } = await $api.post<{ accessToken: string }>(
            "/auth/refresh",
          );
          setAccessToken(data.accessToken);
          processQueue(null, data.accessToken);
          originalRequest.headers["Authorization"] =
            `Bearer ${data.accessToken}`;
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
    },
  );
};

export default $api;

// import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
// import { handleApiError } from "./error.api.ts";
// import { tokenStorage } from "../contexts/AuthContext.tsx";

// const $api = axios.create({
//   baseURL: import.meta.env.VITE_SERVER,
//   headers: {
//     "Content-Type": "application/json",
//   },
//   withCredentials: true,
// });

// /**
//  * Отдельный axios-инстанс без интерцепторов — только для /auth/refresh
//  * чтобы избежать рекурсии и побочных эффектов.
//  */
// const $auth = axios.create({
//   baseURL: import.meta.env.VITE_SERVER,
//   headers: {
//     "Content-Type": "application/json",
//   },
//   withCredentials: true,
// });

// // настройка интерцепторов при инициализации приложения
// export const setupInterceptors = (
//   setAccessToken: (token: string) => void,
//   logout: () => void,
// ) => {
//   let isRefreshing = false;

//   type QueueItem = {
//     resolve: (token: string) => void;
//     reject: (err: unknown) => void;
//   };

//   let failedQueue: QueueItem[] = [];

//   const processQueue = (err: unknown, token?: string) => {
//     failedQueue.forEach((p) => (err ? p.reject(err) : p.resolve(token!)));
//     failedQueue = [];
//   };

//   const isAuthRoute = (url?: string) => {
//     if (!url) return false;
//     return url.includes("/auth/login") || url.includes("/auth/refresh");
//   };

//   // ===== REQUEST =====
//   $api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
//     const token = tokenStorage.get();
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   });

//   // ===== RESPONSE =====
//   $api.interceptors.response.use(
//     (res) => res,
//     async (error: AxiosError) => {
//       const originalRequest: any = error.config;

//       // Сетевые ошибки (нет response) — просто показать и пробросить
//       if (!error.response) {
//         handleApiError(error);
//         return Promise.reject(error);
//       }

//       // не пытаемся refresh-ить login/refresh запросы
//       if (isAuthRoute(originalRequest?.url)) {
//         handleApiError(error);
//         return Promise.reject(error);
//       }

//       const shouldTryRefresh =
//         axios.isAxiosError(error) &&
//         error.response?.status === 401 &&
//         !originalRequest?._retry;

//       if (!shouldTryRefresh) {
//         // Любые не-401 или уже ретраенные — сразу обработать и пробросить
//         handleApiError(error);
//         return Promise.reject(error);
//       }

//       originalRequest._retry = true;

//       // Если refresh уже идёт — ставим запрос в очередь
//       if (isRefreshing) {
//         return new Promise<string>((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         })
//           .then((token) => {
//             originalRequest.headers.Authorization = `Bearer ${token}`;
//             return $api(originalRequest);
//           })
//           .catch((err) => {
//             // очередь отклонена (refresh упал) — показать ошибку
//             handleApiError(err);
//             return Promise.reject(err);
//           });
//       }

//       // запускаем refresh
//       isRefreshing = true;

//       try {
//         const { data } = await $auth.post<{ accessToken: string }>(
//           "/auth/refresh",
//         );

//         setAccessToken(data.accessToken);

//         // разблокировать очередь
//         processQueue(null, data.accessToken);

//         // повторить оригинальный запрос
//         originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
//         return $api(originalRequest);
//       } catch (err) {
//         // refresh не удался => отклоняем очередь, логаут
//         processQueue(err, undefined);
//         logout();

//         // показать ошибку (например "сессия истекла")
//         handleApiError(err);

//         return Promise.reject(err);
//       } finally {
//         isRefreshing = false;
//       }
//     },
//   );
// };

// export default $api;
