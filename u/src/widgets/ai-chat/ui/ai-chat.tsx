import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import DOMPurify from "dompurify";
import { Container } from "@/components";
import {
  AgentChatRequestError,
  sendAgentMessage,
  type AgentChatErrorCode,
  type AgentLink,
} from "@/api/agent/agent.api.ts";
import { useUser } from "@/store/get-user";
import { AiPaymentModal } from "./ai-payment-modal.tsx";
import { AiCampaignDraftCard } from "./ai-campaign-draft-card.tsx";
import styles from "./ai-chat.module.scss";
import { flushCampaignDraftSaves } from "../model/campaign-draft-save-coordinator.ts";

interface Message {
  id: string;
  q: string;
  a: string; // final conclusion — simple HTML, sanitized at render time below
  links: AgentLink[];
  status: "pending" | "success" | "error";
  errorCode?: AgentChatErrorCode;
}

// The chat lives in component state, so navigating to a link chip and back would wipe it.
// Persist per tab so returning to /ai-chat restores the same conversation.
const STORAGE_KEY = "ai-chat:v1";

type PersistedChat = { messages: Message[]; conversationId?: string };

const loadPersistedChat = (): PersistedChat => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<PersistedChat>;
      return {
        conversationId: saved.conversationId,
        messages: Array.isArray(saved.messages)
          ? saved.messages.map((message, index) => ({
              id: message.id ?? `restored-${index}`,
              q: message.q,
              a: message.a ?? "",
              links: message.links ?? [],
              // A request cannot still be running after a reload.
              status: message.status === "pending" ? "error" : (message.status ?? "success"),
              errorCode: message.errorCode,
            }))
          : [],
      };
    }
  } catch {
    /* private mode / corrupt value — start fresh */
  }
  return { messages: [] };
};

// Whitelist-only: no <a>/<img>, no attributes at all. Navigation never comes from this HTML —
// it always comes from the separate `links` field, built server-side from verified routes.
const sanitizeReply = (html: string) =>
  DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "strong", "b", "em", "i", "ul", "ol", "li"],
    ALLOWED_ATTR: [],
  });

const CLIENT_EXAMPLE_PROMPTS = [
  "Find house influencers in Germany under 2000 €",
  "Create a campaign for my new track",
  "Where can I see my invoices?",
];

const INFLUENCER_EXAMPLE_PROMPTS = [
  "Show my active promos",
  "What campaign tasks do I need to complete?",
  "Where can I see my invoices?",
];

const AGENT_ERROR_MESSAGES: Record<AgentChatErrorCode, string> = {
  AGENT_DAILY_LIMIT_REACHED:
    "You've reached today's AI usage limit. You can use the assistant again tomorrow.",
  AGENT_CAPACITY_REACHED:
    "The AI Assistant has reached today's capacity. Please try again tomorrow.",
  AGENT_TURN_IN_PROGRESS:
    "Another AI response is already running for your account. Wait for it to finish, then retry.",
  AGENT_USAGE_UNAVAILABLE:
    "The AI Assistant is temporarily unavailable. Please try again shortly.",
  UNKNOWN: "Couldn't get a response. Please try again.",
};

const NON_RETRYABLE_AGENT_ERRORS = new Set<AgentChatErrorCode>([
  "AGENT_DAILY_LIMIT_REACHED",
  "AGENT_CAPACITY_REACHED",
]);

const getCampaignDraftId = (link: AgentLink) => {
  if (link.kind === "campaign_draft" && link.draftId) return link.draftId;
  return /^\/client\/campaign-draft\/([a-f\d]{24})$/i.exec(link.path)?.[1] ?? null;
};

const withAiSource = (path: string) => {
  if (!path.startsWith("/client/create-campaign") || /(?:\?|&)source=ai(?:&|$)/.test(path)) {
    return path;
  }
  return `${path}${path.includes("?") ? "&" : "?"}source=ai`;
};

// Shared chat block: identical for client and influencer.
// Role is resolved server-side from the JWT, so this component is role-agnostic.
export const AiChat = () => {
  const queryClient = useQueryClient();
  const role = useUser((state) => state.user?.role ?? state.role);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(() => loadPersistedChat().messages);
  // Held across turns so the backend can load this conversation's memory.
  const [conversationId, setConversationId] = useState<string | undefined>(
    () => loadPersistedChat().conversationId,
  );
  // When set, the in-chat payment modal is open for this draft.
  const [paymentDraftId, setPaymentDraftId] = useState<string | null>(null);
  const fillPrompt = (prompt: string) => {
    setInput(prompt);
    window.setTimeout(() => textareaRef.current?.focus(), 0);
  };
  const [isPreparingSend, setIsPreparingSend] = useState(false);
  const [sendPreparationError, setSendPreparationError] = useState(false);

  const messagesRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // A draft can be updated by several tool calls. Render one live card at its latest
  // occurrence instead of repeating stale copies throughout the conversation.
  const latestDraftMessageIndexes = useMemo(() => {
    const indexes = new Map<string, number>();
    messages.forEach((message, index) => {
      message.links.forEach((link) => {
        const draftId = getCampaignDraftId(link);
        if (draftId) indexes.set(draftId, index);
      });
    });
    return indexes;
  }, [messages]);

  const activeDraftId = useMemo(() => {
    for (let messageIndex = messages.length - 1; messageIndex >= 0; messageIndex -= 1) {
      const links = messages[messageIndex].links;
      for (let linkIndex = links.length - 1; linkIndex >= 0; linkIndex -= 1) {
        const draftId = getCampaignDraftId(links[linkIndex]);
        if (draftId) return draftId;
      }
    }
    return undefined;
  }, [messages]);

  const { mutate, isPending } = useMutation({
    mutationFn: ({ message }: { id: string; message: string }) =>
      sendAgentMessage(message, conversationId, activeDraftId),
    onSuccess: ({ reply, links, conversationId: cid }, variables) => {
      setConversationId(cid);
      links.forEach((link) => {
        const linkedDraftId = getCampaignDraftId(link);
        if (linkedDraftId) {
          void queryClient.invalidateQueries({ queryKey: ["campaign-draft", linkedDraftId] });
        }
      });
      setMessages((prev) =>
        prev.map((message) =>
          message.id === variables.id
            ? { ...message, a: reply, links, status: "success", errorCode: undefined }
            : message,
        ),
      );
    },
    onError: (error, variables) => {
      const errorCode =
        error instanceof AgentChatRequestError ? error.code : "UNKNOWN";
      setMessages((prev) =>
        prev.map((message) =>
          message.id === variables.id
            ? { ...message, status: "error", errorCode }
            : message,
        ),
      );
    },
  });

  // Keep the newest message in view.
  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isPending]);

  // Persist the conversation so a chip navigation (and back) doesn't lose it.
  useEffect(() => {
    try {
      if (messages.length === 0) sessionStorage.removeItem(STORAGE_KEY);
      else sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, conversationId }));
    } catch {
      /* storage full / unavailable — non-critical */
    }
  }, [messages, conversationId]);

  // Auto-grow: the textarea expands upward with the text and only scrolls past max-height.
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const next = Math.min(ta.scrollHeight, 120);
    ta.style.height = `${next}px`;
    ta.style.overflowY = ta.scrollHeight > 120 ? "auto" : "hidden";
  }, [input]);

  const prepareAgentAction = async () => {
    setIsPreparingSend(true);
    setSendPreparationError(false);
    try {
      const saved = await flushCampaignDraftSaves();
      if (!saved) setSendPreparationError(true);
      return saved;
    } catch {
      setSendPreparationError(true);
      return false;
    } finally {
      setIsPreparingSend(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isPending || isPreparingSend) return;
    if (!(await prepareAgentAction())) return;
    const message = input.trim();
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    setInput("");
    setMessages((prev) => [
      ...prev,
      { id, q: message, a: "", links: [], status: "pending" },
    ]);
    mutate({ id, message });
  };

  const handleRetry = async (message: Message) => {
    if (isPending || isPreparingSend) return;
    if (!(await prepareAgentAction())) return;
    setMessages((prev) =>
      prev.map((item) =>
        item.id === message.id
          ? { ...item, status: "pending", errorCode: undefined }
          : item,
      ),
    );
    mutate({ id: message.id, message: message.q });
  };

  const handleOpenPayment = async (draftId: string) => {
    if (isPending || isPreparingSend) return;
    if (!(await prepareAgentAction())) return;
    setPaymentDraftId(draftId);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleReset = () => {
    setConversationId(undefined);
    setMessages([]);
    setSendPreparationError(false);
  };

  return (
    <Container className={styles.root}>
      <div className={styles.shell}>
      <div className={styles.header}>
        <h1>AI Assistant</h1>
      </div>

      <div
        className={`${styles.card} ${messages.length === 0 ? styles.cardEmpty : ""}`}
      >
        <div className={styles.messages} ref={messagesRef}>
          {messages.length === 0 && !isPending && (
            <div className={styles.empty}>
              <h3>How can I help?</h3>
              <p>Ask me to find influencers, build a campaign or guide you around the platform.</p>
              <div className={styles.examples}>
                {(role === "influencer" ? INFLUENCER_EXAMPLE_PROMPTS : CLIENT_EXAMPLE_PROMPTS).map((prompt) => (
                  <button
                    key={prompt}
                    className={styles.exampleChip}
                    onClick={() => setInput(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={msg.id} className={styles.messageGroup}>
              <div className={styles.userRow}>
                <div className={styles.userBubble}>{msg.q}</div>
              </div>

              <div className={styles.agentRow} style={{ marginTop: "12px" }}>
                {msg.status === "success" && (
                  <div
                    className={styles.agentBubble}
                    dangerouslySetInnerHTML={{ __html: sanitizeReply(msg.a) }}
                  />
                )}

                {msg.status === "error" && (
                  <div className={styles.errorBubble}>
                    <span>{AGENT_ERROR_MESSAGES[msg.errorCode ?? "UNKNOWN"]}</span>
                    {!NON_RETRYABLE_AGENT_ERRORS.has(msg.errorCode ?? "UNKNOWN") && (
                      <button onClick={() => void handleRetry(msg)} disabled={isPending || isPreparingSend}>
                        Retry
                      </button>
                    )}
                  </div>
                )}

                {msg.status === "success" && msg.links.length > 0 && (
                  <div className={styles.links}>
                    {msg.links.map((link, k) => {
                      const campaignDraftId = getCampaignDraftId(link);
                      if (campaignDraftId) {
                        if (latestDraftMessageIndexes.get(campaignDraftId) !== i) return null;
                        const alreadyRendered = msg.links
                          .slice(0, k)
                          .some((previousLink) => getCampaignDraftId(previousLink) === campaignDraftId);
                        if (alreadyRendered) return null;
                        return (
                          <div key={campaignDraftId} className={styles.draftCardSlot}>
                            <AiCampaignDraftCard
                              draftId={campaignDraftId}
                              onProceedToPayment={(id) => void handleOpenPayment(id)}
                              onPrompt={fillPrompt}
                            />
                          </div>
                        );
                      }

                      // Payment links open the in-chat checkout modal instead of navigating away.
                      if (link.kind === "payment" && link.draftId) {
                        return (
                          <button
                            key={k}
                            className={styles.payChip}
                            disabled={isPending || isPreparingSend}
                            onClick={() => void handleOpenPayment(link.draftId!)}
                          >
                            {link.label} →
                          </button>
                        );
                      }

                      return (
                        <Link key={k} to={withAiSource(link.path)} className={styles.linkChip}>
                          {link.label} →
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isPending && (
            <div className={styles.thinking}>
              Thinking
              <span />
              <span />
              <span />
            </div>
          )}
        </div>

        {sendPreparationError && (
          <div className={styles.saveBeforeSendError} role="alert">
            Campaign changes could not be saved. Retry sending after the connection recovers.
          </div>
        )}

        <div className={styles.inputArea}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isPending || isPreparingSend}
            rows={1}
            placeholder="Type your message…"
          />
          <button
            className={styles.sendButton}
            onClick={() => void handleSend()}
            disabled={isPending || isPreparingSend || !input.trim()}
          >
            {isPending ? "Thinking…" : isPreparingSend ? "Saving…" : "Send"}
          </button>
          <button className={styles.resetButton} onClick={handleReset} disabled={isPending || isPreparingSend}>
            New conversation
          </button>
        </div>
      </div>

      </div>

      {paymentDraftId && (
        <AiPaymentModal draftId={paymentDraftId} onClose={() => setPaymentDraftId(null)} />
      )}
    </Container>
  );
};
