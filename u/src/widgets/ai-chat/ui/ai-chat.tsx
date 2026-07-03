import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import DOMPurify from "dompurify";
import { sendAgentMessage, type AgentLink } from "@/api/agent/agent.api.ts";
import { AiPaymentModal } from "./ai-payment-modal.tsx";

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

// Shared chat block: identical for client and influencer.
// Role is resolved server-side from the JWT, so this component is role-agnostic.
export const AiChat = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  // Held across turns so the backend can load this conversation's memory.
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  // When set, the in-chat payment modal is open for this draft.
  const [paymentDraftId, setPaymentDraftId] = useState<string | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: (msg: string) => sendAgentMessage(msg, conversationId),
    onSuccess: ({ steps, reply, links, conversationId: cid }) => {
      setConversationId(cid);
      setMessages((prev) => [...prev, { q: input, steps, a: reply, links }]);
      setInput("");
    },
  });

  const handleSend = () => {
    if (!input.trim()) return;
    mutate(input);
  };

  const handleReset = () => {
    setConversationId(undefined);
    setMessages([]);
  };

  return (
    <div style={{ padding: "24px", maxWidth: "800px" }}>
      <h2>AI Agent</h2>

      <div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          style={{ width: "100%", marginBottom: "8px" }}
          placeholder="Type your message..."
        />
        <button onClick={handleSend} disabled={isPending || !input.trim()}>
          {isPending ? "Thinking..." : "Send"}
        </button>
        <button onClick={handleReset} disabled={isPending} style={{ marginLeft: "8px" }}>
          New conversation
        </button>
      </div>

      <div style={{ marginTop: "24px" }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{ marginBottom: "16px", borderBottom: "1px solid #ccc", paddingBottom: "12px" }}
          >
            <p><strong>Q:</strong> {msg.q}</p>

            {msg.steps.length > 0 && (
              <div style={{ color: "#888", fontSize: "13px", margin: "8px 0" }}>
                {msg.steps.map((s, j) => (
                  <div key={j}>· {s}</div>
                ))}
              </div>
            )}

            <div>
              <strong>A:</strong>
              <div dangerouslySetInnerHTML={{ __html: sanitizeReply(msg.a) }} />
            </div>

            {msg.links.length > 0 && (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" }}>
                {msg.links.map((link, k) => {
                  const chipStyle = {
                    fontSize: "13px",
                    padding: "4px 10px",
                    border: "1px solid #ccc",
                    borderRadius: "999px",
                    textDecoration: "none",
                  } as const;

                  // Payment links open the in-chat checkout modal instead of navigating away.
                  if (link.kind === "payment" && link.draftId) {
                    return (
                      <button
                        key={k}
                        onClick={() => setPaymentDraftId(link.draftId!)}
                        style={{ ...chipStyle, cursor: "pointer", background: "none" }}
                      >
                        {link.label} →
                      </button>
                    );
                  }

                  return (
                    <Link key={k} to={link.path} style={chipStyle}>
                      {link.label} →
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {paymentDraftId && (
        <AiPaymentModal draftId={paymentDraftId} onClose={() => setPaymentDraftId(null)} />
      )}
    </div>
  );
};
