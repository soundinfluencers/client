import $api from "../api.ts";

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
): Promise<AgentChatResponse> => {
  const result = await $api.post("/agent/chat", { message, conversationId });
  return result.data.data;
};
