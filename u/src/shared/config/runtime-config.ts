declare global {
  interface Window {
    RUNTIME_CONFIG?: {
      PUBLIC_API_URL?: string;
      PAYMENTS_DISABLED?: boolean;
    };
  }
}

const runtimeApiUrl = window.RUNTIME_CONFIG?.PUBLIC_API_URL?.trim();
const buildTimeApiUrl = import.meta.env.VITE_SERVER?.trim();

export const API_URL = runtimeApiUrl || buildTimeApiUrl;
export const PAYMENTS_DISABLED = window.RUNTIME_CONFIG?.PAYMENTS_DISABLED === true;

if (!API_URL) {
  throw new Error(
    "API URL is missing. Set PUBLIC_API_URL in production or VITE_SERVER for local development.",
  );
}
