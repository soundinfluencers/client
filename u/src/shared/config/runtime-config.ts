declare global {
  interface Window {
    RUNTIME_CONFIG?: {
      PUBLIC_API_URL?: string;
      PUBLIC_AGENT_QUEUE_ENABLED?: boolean;
    };
  }
}

const runtimeApiUrl = window.RUNTIME_CONFIG?.PUBLIC_API_URL?.trim();
const buildTimeApiUrl = import.meta.env.VITE_SERVER?.trim();

export const API_URL = runtimeApiUrl || buildTimeApiUrl;
export const AGENT_QUEUE_ENABLED = window.RUNTIME_CONFIG?.PUBLIC_AGENT_QUEUE_ENABLED
  ?? (import.meta.env.VITE_AGENT_QUEUE_ENABLED === "true");

if (!API_URL) {
  throw new Error(
    "API URL is missing. Set PUBLIC_API_URL in production or VITE_SERVER for local development.",
  );
}
