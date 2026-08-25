import axios from "axios";
import $api from "../api.ts";

export const AGENT_CHAT_ERROR_CODES = [
  "AGENT_DAILY_LIMIT_REACHED",
  "AGENT_CAPACITY_REACHED",
  "AGENT_TURN_IN_PROGRESS",
  "AGENT_USAGE_UNAVAILABLE",
  "UNKNOWN",
] as const;

export type AgentChatErrorCode = (typeof AGENT_CHAT_ERROR_CODES)[number];

export class AgentChatRequestError extends Error {
  readonly code: AgentChatErrorCode;

  constructor(code: AgentChatErrorCode) {
    super(code);
    this.name = "AgentChatRequestError";
    this.code = code;
  }
}

const isAgentChatErrorCode = (value: unknown): value is AgentChatErrorCode =>
  typeof value === "string" &&
  AGENT_CHAT_ERROR_CODES.includes(value as AgentChatErrorCode) &&
  value !== "UNKNOWN";

export interface AgentLink {
  label: string;
  path: string;
  // Typed hint from the backend tools: 'payment' opens the in-chat payment modal.
  kind?: string;
  draftId?: string;
  // What the tool did, stamped server-side when it ran. Rendered as a history
  // receipt in the transcript, so it must never be recomputed from live data.
  summary?: string;
  section?: "brief" | "strategy" | "pages" | "content" | "promo";
}

export interface AgentSearchCandidate {
  accountId: string;
  influencerId: string;
  username: string;
  logoUrl?: string;
  followers: number;
  priceEUR: number;
  price: number;
  currency: "EUR" | "GBP" | "USD";
  socialMedia: string;
  profileType: "creator" | "community";
  countryShare?: number;
}

export interface AgentSearchOutcome {
  status: "completed" | "empty" | "failed";
  page: number;
  loadedCount: number;
  totalExact: number;
  hasMore: boolean;
  nextPage?: number;
  candidates: AgentSearchCandidate[];
}

export interface AgentMedia {
  type: "image";
  url: string;
  alt: string;
  draftId?: string;
}

export interface AgentChatResponse {
  steps: string[];
  reply: string;
  links: AgentLink[];
  conversationId: string;
  search?: AgentSearchOutcome;
  media?: AgentMedia[];
}

// Shared by client and influencer — the backend derives the role from the JWT.
export const sendAgentMessage = async (
  message: string,
  conversationId?: string,
  activeDraftId?: string,
  image?: File,
): Promise<AgentChatResponse> => {
  try {
    const body = image
      ? (() => {
          const form = new FormData();
          form.append("message", message);
          if (conversationId) form.append("conversationId", conversationId);
          if (activeDraftId) form.append("activeDraftId", activeDraftId);
          form.append("image", image);
          return form;
        })()
      : { message, conversationId, activeDraftId };
    const result = await $api.post(
      "/agent/chat",
      body,
      image
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : undefined,
    );
    return result.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const code = (error.response?.data as { code?: unknown } | undefined)
        ?.code;
      throw new AgentChatRequestError(
        isAgentChatErrorCode(code) ? code : "UNKNOWN",
      );
    }
    throw new AgentChatRequestError("UNKNOWN");
  }
};
