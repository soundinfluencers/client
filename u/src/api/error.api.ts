import { toast } from "react-toastify";
import axios from "axios";
import { getErrorMapper } from "./error-mapper-registry.ts";

type ApiErrorResponse = { error?: string; message?: string };

export const handleApiError = (error: unknown): void => {
  if (isCheckAuthError(error) || isRefreshAuthError(error)) return;

  let msg = "An unexpected error occurred. Please try again later.";

  if (axios.isAxiosError(error)) {
    const res = error.response?.data as ApiErrorResponse | undefined;

    const service = extractServiceName(error.config?.url);
    const mapper = service ? getErrorMapper(service) : undefined;
    if (mapper) msg = mapper(res?.error, msg);

    if (res?.message) msg = res.message;

    if (!res?.error && !res?.message)
      msg = getHttpStatusMessage(error.response?.status);
  } else if (error instanceof Error) {
    msg = error.message;
  }

  toast.error(msg, {
    // position: "bottom-center",
    autoClose: 5000,
  });
};

const extractServiceName = (url?: string): string | null => {
  if (!url) return null;
  const match = /\/api\/([^/?]+)/.exec(url);
  return match ? match[1] : null;
};

const getHttpStatusMessage = (status?: number): string => {
  switch (status) {
    case 400:
      return "Bad request. Please check your input.";
    case 401:
      return "Unauthorized. Please login again.";
    case 403:
      return "You don't have permission for this action.";
    case 404:
      return "Resource not found.";
    case 409:
      return "Conflict detected. Please resolve the issue and try again.";
    case 422:
      return "Validation error. Please check your input.";
    case 429:
      return "Too many requests. Please wait and try again later.";
    case 500:
      return "Something went wrong. Please try again later.";
    case 503:
      return "Service unavailable. Please try again later.";
    default:
      return "An unexpected error occurred. Please try again later.";
  }
};

const isCheckAuthError = (err: unknown) =>
  axios.isAxiosError(err) &&
  err.config?.url?.endsWith("/auth/check") &&
  err.response?.status === 401;

const isRefreshAuthError = (err: unknown) =>
  axios.isAxiosError(err) && err.config?.url?.endsWith("/auth/refresh");
