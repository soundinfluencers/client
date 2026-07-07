import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import DOMPurify from "dompurify";
import { Container } from "@/components";
import { sendAgentMessage, type AgentLink } from "@/api/agent/agent.api.ts";
import { AiPaymentModal } from "./ai-payment-modal.tsx";
import styles from "./ai-chat.module.scss";

interface Message {
  q: string;
  steps: string[]; // visible progress lines (the agent's tool queries stay hidden)
  a: string; // final conclusion — simple HTML, sanitized at render time below
  links: AgentLink[];
}

// Whitelist-only: no <a>/<img>, no attributes at all. Navigation never comes from this HTML —
// it always comes from the separate `links` field, built server-side from verified routes.
const sanitizeReply = (html: string) =>
  DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "strong", "b", "em", "i", "ul", "ol", "li"],
    ALLOWED_ATTR: [],
  });

const EXAMPLE_PROMPTS = [
  "Find house influencers in Germany under 2000 €",
  "Create a campaign for my new track",
  "Where can I see my invoices?",
];

// Shared chat block: identical for client and influencer.
// Role is resolved server-side from the JWT, so this component is role-agnostic.
export const AiChat = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  // Held across turns so the backend can load this conversation's memory.
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  // When set, the in-chat payment modal is open for this draft.
  const [paymentDraftId, setPaymentDraftId] = useState<string | null>(null);

  const messagesRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: (msg: string) => sendAgentMessage(msg, conversationId),
    onSuccess: ({ steps, reply, links, conversationId: cid }) => {
      setConversationId(cid);
      setMessages((prev) => [...prev, { q: input, steps, a: reply, links }]);
      setInput("");
    },
  });

  // Keep the newest message in view.
  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isPending]);

  // Auto-grow: the textarea expands upward with the text and only scrolls past max-height.
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const next = Math.min(ta.scrollHeight, 120);
    ta.style.height = `${next}px`;
    ta.style.overflowY = ta.scrollHeight > 120 ? "auto" : "hidden";
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || isPending) return;
    mutate(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setConversationId(undefined);
    setMessages([]);
  };

  return (
    <Container className={styles.root}>
      <div className={styles.shell}>
      <div className={styles.header}>
        <h1>AI Assistant</h1>
        <p>Describe your campaign in plain words — search, drafting and checkout happen right here.</p>
      </div>

      <div className={styles.card}>
        <div className={styles.messages} ref={messagesRef}>
          {messages.length === 0 && !isPending && (
            <div className={styles.empty}>
              <h3>How can I help?</h3>
              <p>Ask me to find influencers, build a campaign or guide you around the platform.</p>
              <div className={styles.examples}>
                {EXAMPLE_PROMPTS.map((prompt) => (
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
            <div key={i}>
              <div className={styles.userRow}>
                <div className={styles.userBubble}>{msg.q}</div>
              </div>

              <div className={styles.agentRow} style={{ marginTop: "12px" }}>
                {msg.steps.length > 0 && (
                  <div className={styles.steps}>
                    {msg.steps.map((s, j) => (
                      <div key={j}>· {s}</div>
                    ))}
                  </div>
                )}

                <div
                  className={styles.agentBubble}
                  dangerouslySetInnerHTML={{ __html: sanitizeReply(msg.a) }}
                />

                {msg.links.length > 0 && (
                  <div className={styles.links}>
                    {msg.links.map((link, k) => {
                      // Payment links open the in-chat checkout modal instead of navigating away.
                      if (link.kind === "payment" && link.draftId) {
                        return (
                          <button
                            key={k}
                            className={styles.payChip}
                            onClick={() => setPaymentDraftId(link.draftId!)}
                          >
                            {link.label} →
                          </button>
                        );
                      }

                      return (
                        <Link key={k} to={link.path} className={styles.linkChip}>
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

        <div className={styles.inputArea}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Type your message…"
          />
          <button
            className={styles.sendButton}
            onClick={handleSend}
            disabled={isPending || !input.trim()}
          >
            {isPending ? "Thinking…" : "Send"}
          </button>
          <button className={styles.resetButton} onClick={handleReset} disabled={isPending}>
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
