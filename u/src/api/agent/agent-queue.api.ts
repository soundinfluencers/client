import $api from "../api.ts";
import axios from "axios";
import { AgentChatRequestError, type AgentChatResponse } from "./agent.api.ts";
import { isAgentSearchOutcome } from "./agent-response.validation.ts";

const route = "/agent/v1";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function submitQueuedMessage(message: string, conversationId?: string, activeDraftId?: string) {
  const id: string = conversationId && uuid.test(conversationId)
    ? conversationId
    : (await $api.post(`${route}/conversations`)).data.data.conversationId;
  try {
    const response = await $api.post(`${route}/conversations/${id}/runs`, {
      requestId: crypto.randomUUID(), message, activeDraftId,
    });
    return { conversationId: id, runId: response.data.data.runId as string };
  } catch (error) {
    if (!axios.isAxiosError(error) || error.response?.status !== 429) throw error;
    const code = error.response.data?.code;
    throw new AgentChatRequestError(code === "user_token_limit" ? "AGENT_DAILY_LIMIT_REACHED" : "AGENT_CAPACITY_REACHED");
  }
}

export async function cancelQueuedMessage(runId: string) {
  await $api.post(`${route}/runs/${runId}/cancel`);
}

export async function awaitQueuedReply(
  conversationId: string, runId: string, signal?: AbortSignal,
): Promise<AgentChatResponse & { promo?: { count: number; model: string } }> {
  let cursor = "0";
  for (let attempt = 0; attempt < 3; attempt += 1) {
    signal?.throwIfAborted();
    try {
      const response = await $api.get<ReadableStream<Uint8Array>>(`${route}/runs/${runId}/events`, {
        adapter: "fetch", responseType: "stream", signal, headers: { "Last-Event-ID": cursor },
      });
      const reader = response.data.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      try {
        for (;;) {
          const chunk = await reader.read();
          if (chunk.done) break;
          buffer = (buffer + decoder.decode(chunk.value, { stream: true })).replace(/\r\n/g, "\n");
          let boundary = buffer.indexOf("\n\n");
          while (boundary >= 0) {
            const frame = buffer.slice(0, boundary);
            buffer = buffer.slice(boundary + 2);
            boundary = buffer.indexOf("\n\n");
            const type = /^event: ?(.*)$/m.exec(frame)?.[1];
            const id = /^id: ?(\d+)$/m.exec(frame)?.[1];
            if (type === "failed" || type === "cancelled") {
              const data = JSON.parse(/^data: ?(.*)$/m.exec(frame)?.[1] ?? "null");
              throw new TerminalRunError(data?.code ?? type);
            }
            if (type === "completed") {
              const data = JSON.parse(/^data: ?(.*)$/m.exec(frame)?.[1] ?? "null");
              if (typeof data?.text !== "string") throw new TerminalRunError("Invalid agent response");
              const draftId = data.briefReceipt?.draftId;
              const section = data.briefReceipt?.section === "pages" ? "pages"
                : data.briefReceipt?.section === "content" ? "content" : "brief";
              const links: AgentChatResponse["links"] = typeof draftId === "string" && /^[0-9a-f]{24}$/i.test(draftId)
                ? [{
                  label: section === "pages" ? "Open pages" : section === "content" ? "Open content" : "Open brief",
                  path: `/client/campaign-draft/${draftId}`, draftId, section,
                  summary: data.briefReceipt.created ? "Draft created" : section === "pages" ? "Pages saved" : section === "content" ? "Content saved" : "Brief saved",
                }]
                : [];
              return {
                conversationId, reply: data.text, links, steps: [],
                ...(isAgentSearchOutcome(data.catalog) ? { search: data.catalog } : {}),
                ...(Array.isArray(data.images) && typeof data.model === "string"
                  ? { promo: { count: data.images.length, model: data.model } } : {}),
              };
            }
            if (id) cursor = id;
          }
        }
      } finally {
        await reader.cancel().catch(() => {});
        reader.releaseLock();
      }
    } catch (error) {
      if (signal?.aborted || error instanceof TerminalRunError || attempt === 2) throw error;
    }
  }
  throw new Error("Agent stream disconnected");
}

export class TerminalRunError extends Error {}
