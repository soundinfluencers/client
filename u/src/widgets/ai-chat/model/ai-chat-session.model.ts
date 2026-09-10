import DOMPurify from "dompurify";
import type {
  AgentChatErrorCode,
  AgentLink,
  AgentMedia,
  AgentSearchOutcome,
} from "@/api/agent/agent.api.ts";
import type { CampaignSetupSurface } from "@/entities/client-side/campaign-setup/model/campaign-setup.model.ts";
import {
  isAiChatPersistedState,
  readAiChatState,
  readAiWorkspaceSurface,
  type AiChatIdentity,
} from "./ai-chat-persistence.ts";
// A turn the workspace starts on the client's behalf: the brief is complete, more pages are
// wanted, or the pages changed while the panel was open.
export type WorkspaceFollowUp = "brief" | "more" | "pages";

export interface Message {
  id: string;
  q: string;
  a: string; // final conclusion — simple HTML, sanitized at render time below
  links: AgentLink[];
  media: AgentMedia[];
  status: "pending" | "success" | "error";
  errorCode?: AgentChatErrorCode;
  // The backend request may differ from the visible user bubble for automatic workspace actions.
  request?: string;
  recommendationAction?: "brief" | "more";
  // Work the user did in the workspace, not a turn with the agent. Kept in the same
  // list so the transcript reads as one timeline of what happened to the campaign.
  note?: { text: string; section: CampaignSetupSurface };
  // A hardcoded welcome from the assistant has no preceding user bubble. Keeping it
  // in the transcript makes the guided start survive navigation and page reloads.
  assistantOnly?: boolean;
  // A local preview of the file sent with this turn. Generated output lives in `media`.
  userImage?: { url: string; name: string };
}

export const readStoredSurface = (
  identity: AiChatIdentity | null,
): CampaignSetupSurface | null => {
  if (identity?.role !== "client") return null;
  const stored = readAiWorkspaceSurface(sessionStorage, identity);
  if (stored === "strategy") return "brief";
  return stored === "brief" ||
    stored === "pages" ||
    stored === "content" ||
    stored === "promo"
    ? stored
    : null;
};

// Section names as the user sees them in the rail.
export const SECTION_LABELS: Record<CampaignSetupSurface, string> = {
  brief: "Brief",
  pages: "Pages",
  content: "Content",
  promo: "Promo",
};

export type PersistedChat = {
  messages: Message[];
  conversationId?: string;
  activeDraftId?: string;
  role?: string;
  recommendationsByDraft?: Record<string, AgentSearchOutcome>;
};

export const isPersistedChat = (value: unknown): value is Partial<PersistedChat> => {
  return isAiChatPersistedState(value);
};

export const GUIDED_CAMPAIGN_WELCOME =
  "<p><strong>Let’s create your campaign.</strong></p>" +
  "<p>Send the essentials in one message:</p>" +
  "<ul><li>campaign goal</li><li>approximate budget and currency</li><li>music genre(s)</li><li>platform(s)</li><li>target countries or Worldwide</li><li>timing or Flexible</li></ul>" +
  "<p>Then I’ll recommend pages, explain the budget fit and tell you the next action. Content and First Slide can be added later.</p>";

export const restoreMessage = (message: Message, index: number): Message => {
  // Migrate the old one-line campaign receipt into the conversational welcome so
  // an existing browser session receives the improved start as well.
  const isLegacyGuidedStart =
    message.note?.text === "Guided campaign started" && message.note.section === "brief";

  return {
    id: message.id ?? `restored-${index}`,
    q: isLegacyGuidedStart ? "" : (message.q ?? ""),
    a: isLegacyGuidedStart ? GUIDED_CAMPAIGN_WELCOME : (message.a ?? ""),
    links: message.links ?? [],
    media: message.media ?? [],
    // A request cannot still be running after a reload.
    status: message.status === "pending" ? "error" : (message.status ?? "success"),
    errorCode: message.errorCode,
    request: message.request,
    recommendationAction: message.recommendationAction,
    note: isLegacyGuidedStart ? undefined : message.note,
    assistantOnly: isLegacyGuidedStart || message.assistantOnly,
    // blob: URLs belong to the previous document and cannot survive a reload.
    userImage: message.userImage?.url?.startsWith("blob:")
      ? undefined
      : message.userImage,
  };
};

export const loadPersistedChat = (identity: AiChatIdentity | null): PersistedChat => {
  const role = identity?.role;
  if (identity) {
    const saved = readAiChatState<Partial<PersistedChat>>(
      sessionStorage,
      identity,
      isPersistedChat,
    );
    if (saved) {
      if (saved.role && saved.role !== role) return { messages: [], role };
      return {
        conversationId: saved.conversationId,
        activeDraftId: role === "client" ? saved.activeDraftId : undefined,
        recommendationsByDraft:
          role === "client" && saved.recommendationsByDraft
            ? saved.recommendationsByDraft
            : undefined,
        role,
        messages: Array.isArray(saved.messages) ? saved.messages.map(restoreMessage) : [],
      };
    }
  }
  return { messages: [] };
};

// Whitelist-only: no <a>/<img>, no attributes at all. Navigation never comes from this HTML —
// it always comes from the separate `links` field, built server-side from verified routes.
export const sanitizeReply = (html: string) =>
  DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "strong", "b", "em", "i", "ul", "ol", "li"],
    ALLOWED_ATTR: [],
  });

// One-line preview for the strip shown while a working surface covers the transcript.
export const toPlainText = (html: string) =>
  DOMPurify.sanitize(html, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
    .replace(/\s+/g, " ")
    .trim();

export const CLIENT_EXAMPLE_PROMPTS = [
  "Find house influencers in Germany under 2000 €",
  "Create a campaign for my new track",
  "Where can I see my invoices?",
];

export const INFLUENCER_EXAMPLE_PROMPTS = [
  "How do campaign requests work?",
  "What should I prepare before accepting a promo?",
  "How do influencer invoices work?",
];

export const AGENT_ERROR_MESSAGES: Record<AgentChatErrorCode, string> = {
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

export const NON_RETRYABLE_AGENT_ERRORS = new Set<AgentChatErrorCode>([
  "AGENT_DAILY_LIMIT_REACHED",
  "AGENT_CAPACITY_REACHED",
]);

export const getCampaignDraftId = (link: AgentLink) => {
  if (link.kind === "campaign_draft" && link.draftId) return link.draftId;
  return /^\/client\/campaign-draft\/([a-f\d]{24})$/i.exec(link.path)?.[1] ?? null;
};

export const withAiSource = (path: string) => {
  if (
    !path.startsWith("/client/create-campaign") ||
    /(?:\?|&)source=ai(?:&|$)/.test(path)
  ) {
    return path;
  }
  return `${path}${path.includes("?") ? "&" : "?"}source=ai`;
};

export const mergeSearchOutcome = (
  current: AgentSearchOutcome | undefined,
  incoming: AgentSearchOutcome,
): AgentSearchOutcome => {
  if (!current || incoming.page <= 1) return incoming;
  // A continuation can become empty if the roster changes between batches. Keep the pages
  // already loaded instead of replacing the useful list with an empty-state screen.
  if (incoming.status === "empty") {
    return {
      ...current,
      hasMore: false,
      nextPage: undefined,
      totalExact: Math.max(current.totalExact, incoming.totalExact),
    };
  }
  // The toast reports the failure; Pages should remain usable with the confirmed earlier rows.
  if (incoming.status === "failed") return current;
  const byId = new Map(
    current.candidates.map((candidate) => [candidate.accountId, candidate]),
  );
  incoming.candidates.forEach((candidate) => byId.set(candidate.accountId, candidate));
  const candidates = [...byId.values()];
  return { ...incoming, candidates, loadedCount: candidates.length };
};
