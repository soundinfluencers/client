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
  constructor(readonly code: AgentChatErrorCode) {
    super(code);
    this.name = "AgentChatRequestError";
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
}

export interface AgentChatResponse {
  steps: string[];
  reply: string;
  links: AgentLink[];
  conversationId: string;
}

// Shared by client and influencer — the backend derives the role from the JWT.
export const sendAgentMessage = async (
  message: string,
  conversationId?: string,
  activeDraftId?: string,
): Promise<AgentChatResponse> => {
  try {
    const result = await $api.post("/agent/chat", {
      message,
      conversationId,
      activeDraftId,
    });
    return result.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const code = (error.response?.data as { code?: unknown } | undefined)?.code;
      throw new AgentChatRequestError(isAgentChatErrorCode(code) ? code : "UNKNOWN");
    }
    throw new AgentChatRequestError("UNKNOWN");
  }
};
