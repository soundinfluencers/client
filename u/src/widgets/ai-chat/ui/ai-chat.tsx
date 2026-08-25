import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
} from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import DOMPurify from "dompurify";
import { toast } from "react-toastify";
import { Container } from "@/components";
import {
  AgentChatRequestError,
  sendAgentMessage,
  type AgentChatErrorCode,
  type AgentLink,
  type AgentMedia,
  type AgentSearchOutcome,
} from "@/api/agent/agent.api.ts";
import { useUser } from "@/store/get-user";
import type {
  CampaignSetupAction,
  CampaignSetupSurface,
} from "@/entities/client-side/campaign-setup/model/campaign-setup.model.ts";
import { AiPaymentModal } from "./ai-payment-modal.tsx";
import { CampaignStepsRail } from "./campaign-steps-rail.tsx";
import { CampaignWorkspacePanel } from "./campaign-workspace-panel.tsx";
import styles from "./ai-chat.module.scss";
import { flushCampaignDraftSaves } from "../model/campaign-draft-save-coordinator.ts";
import {
  getCampaignDraft,
  startGuidedCampaignDraft,
} from "@/entities/client-side/campaign-draft/api/campaign-draft.api.ts";
import type { CampaignDraftDto } from "@/entities/client-side/campaign-draft/api/campaign-draft.dto.ts";
import { campaignSectionFingerprints } from "@/entities/client-side/campaign-setup/model/campaign-section-changes.ts";
import {
  ACCEPTED_IMAGE_ACCEPT,
  inspectPromoImage,
  MAX_PROMO_IMAGE_MB,
} from "@/entities/client-side/promo-creative/model/promo-image-validation.ts";
import { fitPromoImage } from "@/entities/client-side/promo-creative/model/promo-image-fit.ts";
import imageIcon from "@/assets/icons/image.svg";

// A turn the workspace starts on the client's behalf: the brief is complete, more pages are
// wanted, or the pages changed while the panel was open.
type WorkspaceFollowUp = "brief" | "more" | "pages";

interface Message {
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

// The chat lives in component state, so navigating to a link chip and back would wipe it.
// Persist per tab so returning to /ai-chat restores the same conversation.
const STORAGE_KEY = "ai-chat:v3";
// Which working surface is open over the conversation, if any.
const WORKSPACE_SURFACE_KEY = "ai-chat:workspace-surface";

const chatStorageKey = (role: string) => `${STORAGE_KEY}:${role}`;
const workspaceStorageKey = (role: string) =>
  `${WORKSPACE_SURFACE_KEY}:${role}`;

const readStoredSurface = (role: string): CampaignSetupSurface | null => {
  if (role !== "client") return null;
  const stored = sessionStorage.getItem(workspaceStorageKey(role));
  if (stored === "strategy") return "brief";
  return stored === "brief" ||
    stored === "pages" ||
    stored === "content" ||
    stored === "promo"
    ? stored
    : null;
};

// Section names as the user sees them in the rail.
const SECTION_LABELS: Record<CampaignSetupSurface, string> = {
  brief: "Brief",
  pages: "Pages",
  content: "Content",
  promo: "Promo",
};

type PersistedChat = {
  messages: Message[];
  conversationId?: string;
  activeDraftId?: string;
  role?: string;
  recommendationsByDraft?: Record<string, AgentSearchOutcome>;
};

const GUIDED_CAMPAIGN_WELCOME =
  "<p><strong>Let’s create your campaign.</strong></p>" +
  "<p>We’ll complete a short campaign Brief first, then use it to find the right pages. Additional details can stay open and everything can be changed later.</p>" +
  "<p>What should this campaign achieve? We’ll also confirm an approximate budget, genre, platforms, audience countries and timing.</p>" +
  "<p>After you choose pages, I can help prepare one shared post or tailor the content for each page.</p>";

const restoreMessage = (message: Message, index: number): Message => {
  // Migrate the old one-line campaign receipt into the conversational welcome so
  // an existing browser session receives the improved start as well.
  const isLegacyGuidedStart =
    message.note?.text === "Guided campaign started" &&
    message.note.section === "brief";

  return {
    id: message.id ?? `restored-${index}`,
    q: isLegacyGuidedStart ? "" : (message.q ?? ""),
    a: isLegacyGuidedStart ? GUIDED_CAMPAIGN_WELCOME : (message.a ?? ""),
    links: message.links ?? [],
    media: message.media ?? [],
    // A request cannot still be running after a reload.
    status:
      message.status === "pending" ? "error" : (message.status ?? "success"),
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

const loadPersistedChat = (role: string): PersistedChat => {
  try {
    const raw = sessionStorage.getItem(chatStorageKey(role));
    if (raw) {
      const saved = JSON.parse(raw) as Partial<PersistedChat>;
      if (saved.role && saved.role !== role) return { messages: [], role };
      return {
        conversationId: saved.conversationId,
        activeDraftId: role === "client" ? saved.activeDraftId : undefined,
        recommendationsByDraft:
          role === "client" && saved.recommendationsByDraft
            ? saved.recommendationsByDraft
            : undefined,
        role,
        messages: Array.isArray(saved.messages)
          ? saved.messages.map(restoreMessage)
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

// One-line preview for the strip shown while a working surface covers the transcript.
const toPlainText = (html: string) =>
  DOMPurify.sanitize(html, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
    .replace(/\s+/g, " ")
    .trim();

const CLIENT_EXAMPLE_PROMPTS = [
  "Find house influencers in Germany under 2000 €",
  "Create a campaign for my new track",
  "Where can I see my invoices?",
];

const INFLUENCER_EXAMPLE_PROMPTS = [
  "How do campaign requests work?",
  "What should I prepare before accepting a promo?",
  "How do influencer invoices work?",
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
  return (
    /^\/client\/campaign-draft\/([a-f\d]{24})$/i.exec(link.path)?.[1] ?? null
  );
};

const withAiSource = (path: string) => {
  if (
    !path.startsWith("/client/create-campaign") ||
    /(?:\?|&)source=ai(?:&|$)/.test(path)
  ) {
    return path;
  }
  return `${path}${path.includes("?") ? "&" : "?"}source=ai`;
};

const mergeSearchOutcome = (
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
  incoming.candidates.forEach((candidate) =>
    byId.set(candidate.accountId, candidate),
  );
  const candidates = [...byId.values()];
  return { ...incoming, candidates, loadedCount: candidates.length };
};

// The same chat shell serves both roles, while storage, examples and server-side
// capabilities remain role-specific.
export const AiChat = () => {
  const queryClient = useQueryClient();
  const role = useUser((state) => state.user?.role ?? state.role);
  const resolvedRole = role ?? "client";
  const initialChat = useMemo(
    () => loadPersistedChat(resolvedRole),
    [resolvedRole],
  );
  const [activeStateRole, setActiveStateRole] = useState(resolvedRole);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(initialChat.messages);
  // Held across turns so the backend can load this conversation's memory.
  const [conversationId, setConversationId] = useState<string | undefined>(
    initialChat.conversationId,
  );
  const [selectedDraftId, setSelectedDraftId] = useState<string | undefined>(
    initialChat.activeDraftId,
  );
  const [recommendationsByDraft, setRecommendationsByDraft] = useState<
    Record<string, AgentSearchOutcome>
  >(initialChat.recommendationsByDraft ?? {});
  const [queuedRecommendation, setQueuedRecommendation] = useState<{
    action: WorkspaceFollowUp;
    draftId: string;
  } | null>(null);
  const [isStartingCampaign, setIsStartingCampaign] = useState(false);
  // The pages signature as it was when the surface opened. Edits there are saved on a
  // debounce, so the close handler compares against this instead of watching every keystroke.
  const pagesOnOpenRef = useRef<string | null>(null);
  const [campaignStartError, setCampaignStartError] = useState(false);
  // When set, the in-chat payment modal is open for this draft.
  const [paymentDraftId, setPaymentDraftId] = useState<string | null>(null);
  const [isPreparingSend, setIsPreparingSend] = useState(false);
  const [sendPreparationError, setSendPreparationError] = useState(false);
  const [workspaceSurface, setWorkspaceSurface] =
    useState<CampaignSetupSurface | null>(() =>
      readStoredSurface(resolvedRole),
    );
  const [dialogueUnread, setDialogueUnread] = useState(false);
  const [attachment, setAttachment] = useState<{
    file: File;
    previewUrl: string;
    resized: boolean;
  } | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [isInspectingAttachment, setIsInspectingAttachment] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);

  const messagesRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentsByMessageRef = useRef(new Map<string, File>());

  const linkedDraftId = useMemo(() => {
    for (
      let messageIndex = messages.length - 1;
      messageIndex >= 0;
      messageIndex -= 1
    ) {
      const links = messages[messageIndex].links;
      for (let linkIndex = links.length - 1; linkIndex >= 0; linkIndex -= 1) {
        const draftId = getCampaignDraftId(links[linkIndex]);
        if (draftId) return draftId;
      }
    }
    return undefined;
  }, [messages]);
  const activeDraftId =
    role === "client" ? (selectedDraftId ?? linkedDraftId) : undefined;

  // Auth state can change without remounting this route. Restore the new role's
  // isolated transcript instead of retaining the previous user's in-memory state.
  useEffect(() => {
    if (activeStateRole === resolvedRole) return;
    const restored = loadPersistedChat(resolvedRole);
    setMessages(restored.messages);
    setConversationId(restored.conversationId);
    setSelectedDraftId(restored.activeDraftId);
    setRecommendationsByDraft(restored.recommendationsByDraft ?? {});
    setQueuedRecommendation(null);
    setWorkspaceSurface(readStoredSurface(resolvedRole));
    setPaymentDraftId(null);
    setCampaignStartError(false);
    setSendPreparationError(false);
    setDialogueUnread(false);
    setAttachment((current) => {
      if (current) URL.revokeObjectURL(current.previewUrl);
      return null;
    });
    setAttachmentError(null);
    setActiveStateRole(resolvedRole);
  }, [activeStateRole, resolvedRole]);

  const { mutate, isPending } = useMutation({
    mutationFn: ({
      message,
      draftId,
      image,
    }: {
      id: string;
      message: string;
      recommendationAction?: "brief" | "more";
      draftId?: string;
      image?: File;
    }) =>
      sendAgentMessage(
        message,
        conversationId,
        draftId ?? activeDraftId,
        image,
      ),
    onSuccess: (
      { reply, links, conversationId: cid, search, media = [] },
      variables,
    ) => {
      setConversationId(cid);
      links.forEach((link) => {
        const linkedDraftId = getCampaignDraftId(link);
        if (linkedDraftId) {
          setSelectedDraftId(linkedDraftId);
          void queryClient.invalidateQueries({
            queryKey: ["campaign-draft", linkedDraftId],
          });
        }
      });
      setMessages((prev) =>
        prev.map((message) =>
          message.id === variables.id
            ? {
                ...message,
                a: reply,
                links,
                media,
                status: "success",
                errorCode: undefined,
              }
            : message,
        ),
      );
      if (workspaceSurface) setDialogueUnread(true);
      attachmentsByMessageRef.current.delete(variables.id);
      if (search && variables.draftId) {
        setRecommendationsByDraft((current) => ({
          ...current,
          [variables.draftId!]: mergeSearchOutcome(
            current[variables.draftId!],
            search,
          ),
        }));
      }
      if (variables.recommendationAction) {
        if (!search || search.status === "failed") {
          toast.error(
            variables.recommendationAction === "more"
              ? "More matching pages could not be loaded."
              : "The brief was saved, but the page search did not complete.",
          );
        } else if (search.status === "empty") {
          toast.info(
            variables.recommendationAction === "more"
              ? "There are no more matching pages in this search."
              : "Brief saved. No exact matching pages were found.",
          );
        } else {
          const destination =
            variables.recommendationAction === "more"
              ? "more pages"
              : "matching pages";
          toast.success(
            `${search.loadedCount} ${destination} loaded. Review them in Pages.`,
          );
        }
      }
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
      if (variables.recommendationAction) {
        toast.error(
          variables.recommendationAction === "more"
            ? "More matching pages could not be loaded."
            : "The brief was saved, but matching pages could not be loaded.",
        );
      }
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
      // During a live role switch, the old in-memory transcript is discarded by
      // the effect above. Never write that old transcript into the new role's key.
      if (activeStateRole !== resolvedRole) return;
      const key = chatStorageKey(activeStateRole);
      if (messages.length === 0) sessionStorage.removeItem(key);
      else
        sessionStorage.setItem(
          key,
          JSON.stringify({
            messages,
            conversationId,
            activeDraftId,
            recommendationsByDraft,
            role: activeStateRole,
          }),
        );
    } catch {
      /* storage full / unavailable — non-critical */
    }
  }, [
    messages,
    conversationId,
    activeDraftId,
    activeStateRole,
    recommendationsByDraft,
    resolvedRole,
  ]);

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

  const chooseAttachment = async (file?: File) => {
    if (!file) return;
    if (role !== "client" || !activeDraftId) {
      setAttachmentError(
        "Start or open a campaign before adding a promo image.",
      );
      return;
    }
    setIsInspectingAttachment(true);
    setAttachmentError(null);
    try {
      // A chat attachment is only ever a source for the model, so shrink it to what the
      // image service takes rather than bouncing the client's camera photo back at them.
      const prepared = await fitPromoImage(file);
      await inspectPromoImage(prepared, "photo");
      const previewUrl = URL.createObjectURL(prepared);
      setAttachment((current) => {
        if (current) URL.revokeObjectURL(current.previewUrl);
        return { file: prepared, previewUrl, resized: prepared !== file };
      });
      window.setTimeout(() => textareaRef.current?.focus(), 0);
    } catch (error) {
      setAttachmentError(
        error instanceof Error ? error.message : "This image cannot be used.",
      );
    } finally {
      setIsInspectingAttachment(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeAttachment = () => {
    setAttachment((current) => {
      if (current) URL.revokeObjectURL(current.previewUrl);
      return null;
    });
    setAttachmentError(null);
  };

  const handleImageDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.types.includes("Files")) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setIsDraggingImage(true);
  };

  const handleImageDragLeave = (event: DragEvent<HTMLDivElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && event.currentTarget.contains(next)) return;
    setIsDraggingImage(false);
  };

  const handleImageDrop = (event: DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.files.length) return;
    event.preventDefault();
    setIsDraggingImage(false);
    void chooseAttachment(event.dataTransfer.files[0]);
  };

  const handleSend = async () => {
    if (!input.trim() || isPending || isPreparingSend || isInspectingAttachment)
      return;
    if (!(await prepareAgentAction())) return;
    const message = input.trim();
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const sentAttachment = attachment;

    closeWorkspace();
    setInput("");
    setAttachment(null);
    setAttachmentError(null);
    if (sentAttachment)
      attachmentsByMessageRef.current.set(id, sentAttachment.file);
    setMessages((prev) => [
      ...prev,
      {
        id,
        q: message,
        a: "",
        links: [],
        media: [],
        status: "pending",
        ...(sentAttachment
          ? {
              userImage: {
                url: sentAttachment.previewUrl,
                name: sentAttachment.file.name,
              },
            }
          : {}),
      },
    ]);
    mutate({
      id,
      message,
      draftId: activeDraftId,
      image: sentAttachment?.file,
    });
  };

  const handleRetry = async (message: Message) => {
    if (isPending || isPreparingSend) return;
    if (!(await prepareAgentAction())) return;
    closeWorkspace();
    setMessages((prev) =>
      prev.map((item) =>
        item.id === message.id
          ? { ...item, status: "pending", errorCode: undefined }
          : item,
      ),
    );
    mutate({
      id: message.id,
      message: message.request ?? message.q,
      recommendationAction: message.recommendationAction,
      draftId: activeDraftId,
      image: attachmentsByMessageRef.current.get(message.id),
    });
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
    if (attachment) URL.revokeObjectURL(attachment.previewUrl);
    messages.forEach((message) => {
      if (message.userImage?.url.startsWith("blob:"))
        URL.revokeObjectURL(message.userImage.url);
    });
    attachmentsByMessageRef.current.clear();
    setConversationId(undefined);
    setMessages([]);
    setSelectedDraftId(undefined);
    setRecommendationsByDraft({});
    setQueuedRecommendation(null);
    setCampaignStartError(false);
    setSendPreparationError(false);
    setWorkspaceSurface(null);
    setDialogueUnread(false);
    setAttachment(null);
    setAttachmentError(null);
    sessionStorage.removeItem(workspaceStorageKey(resolvedRole));
  };

  const handleStartCampaign = async () => {
    if (role !== "client" || isStartingCampaign) return;
    setIsStartingCampaign(true);
    setCampaignStartError(false);
    try {
      const { draftId } = await startGuidedCampaignDraft();
      setSelectedDraftId(draftId);
      // A guided campaign begins in Dialogue. The brief remains one click away in
      // the rail and below the welcome, but never replaces the conversation.
      setWorkspaceSurface(null);
      setDialogueUnread(false);
      sessionStorage.removeItem(workspaceStorageKey("client"));
      setMessages((current) => [
        ...current,
        {
          id: `guided-welcome-${Date.now()}`,
          q: "",
          a: GUIDED_CAMPAIGN_WELCOME,
          links: [
            {
              label: "Open Brief",
              path: `/client/campaign-draft/${draftId}`,
              kind: "campaign_draft",
              draftId,
              section: "brief",
            },
          ],
          status: "success",
          media: [],
          assistantOnly: true,
        },
      ]);
    } catch {
      setCampaignStartError(true);
    } finally {
      setIsStartingCampaign(false);
    }
  };

  const openWorkspace = (surface: CampaignSetupSurface) => {
    // Switching straight from Pages to another section never passes through closeWorkspace,
    // so leaving the table has to be handled here too or those edits go unnoticed.
    if (surface !== "pages") leavePagesSurface();
    setWorkspaceSurface(surface);
    sessionStorage.setItem(workspaceStorageKey(resolvedRole), surface);
    // Only the pages table is watched: content is edited page by page and would fire on
    // nearly every visit, and the brief already reports itself through onBriefReady.
    if (surface === "pages" && activeDraftId) {
      const cached = queryClient.getQueryData<CampaignDraftDto>([
        "campaign-draft",
        activeDraftId,
      ]);
      pagesOnOpenRef.current = cached
        ? campaignSectionFingerprints(cached).pages
        : null;
    } else {
      pagesOnOpenRef.current = null;
    }
  };

  // Work done in the workspace leaves the same kind of trace as work done by the agent,
  // so re-reading the conversation explains the whole campaign, not just half of it.
  const addNote = (text: string, section: CampaignSetupSurface) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `note-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        q: "",
        a: "",
        links: [],
        media: [],
        status: "success",
        note: { text, section },
      },
    ]);
  };

  const startRecommendation = useCallback(
    (action: WorkspaceFollowUp, draftId: string) => {
      const request =
        action === "pages"
          ? // Not a search: the pages are already chosen. The only open question is what the
            // change did to the publishing content that was written for the previous set.
            "The client just changed the selected pages in the Pages table. Read the campaign " +
            "draft, then answer in at most two lines: name any selected page that now has no " +
            "publishing content, and offer to apply the existing shared details to it. If every " +
            "selected page already has content, say only that the pages are up to date. Do not " +
            "search for new pages and do not change anything until the client agrees."
          : action === "more"
            ? "Load the next batch of campaign page recommendations now. Reuse every filter from " +
              "lastSearchRequest and call search_accounts with page=nextSearchPage. Do not restart at page 1."
            : // The brief can also be re-saved long after pages were chosen, so this must not read
              // as "start over": a changed brief is a reason to offer a swap, not to perform one.
              "The saved campaign brief is complete. If pages are already selected, check them against " +
              "the brief first: name in one line the ones that no longer fit and offer to replace them, " +
              "changing nothing until the client agrees. Otherwise search the roster using every relevant " +
              "value the brief contains and recommend suitable pages. " +
              "Treat its budget as an approximate target when present, use budgetCurrency correctly, " +
              "show the pages, ask whether the client wants to add or remove pages from the approximate " +
              "total, and if the result is capped ask whether they want more options.";
      const id = `${action}-recommendations-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setMessages((prev) => [
        ...prev,
        {
          id,
          q: "",
          request,
          a: "",
          links: [],
          media: [],
          status: "pending",
          assistantOnly: true,
          // A page-change follow-up runs no search, so the search toasts must stay out of it.
          recommendationAction: action === "pages" ? undefined : action,
        },
      ]);
      mutate({
        id,
        message: request,
        recommendationAction: action === "pages" ? undefined : action,
        draftId,
      });
    },
    [mutate],
  );

  const queueOrStartRecommendation = useCallback(
    (action: WorkspaceFollowUp) => {
      if (!activeDraftId) {
        toast.error(
          "Open a campaign draft before searching for matching pages.",
        );
        return;
      }
      if (isPending || isPreparingSend) {
        setQueuedRecommendation({ action, draftId: activeDraftId });
        toast.info(
          action === "pages"
            ? "The assistant will check the changed pages after the current reply."
            : "The page search will start after the current assistant reply.",
        );
        return;
      }
      startRecommendation(action, activeDraftId);
    },
    [activeDraftId, isPending, isPreparingSend, startRecommendation],
  );

  const handleBriefReady = () => queueOrStartRecommendation("brief");
  const handleMoreRecommendations = () => queueOrStartRecommendation("more");

  useEffect(() => {
    if (!queuedRecommendation || isPending || isPreparingSend) return;
    const queued = queuedRecommendation;
    setQueuedRecommendation(null);
    startRecommendation(queued.action, queued.draftId);
  }, [isPending, isPreparingSend, queuedRecommendation, startRecommendation]);

  // The pages table saves on a debounce, so the signature it had on open is only comparable
  // once those saves have landed. Flushing first is what makes one editing session produce
  // one follow-up instead of one per keystroke.
  const checkPagesChangedOnClose = useCallback(
    async (draftId: string, before: string) => {
      try {
        if (!(await flushCampaignDraftSaves())) return;
        const draft = await getCampaignDraft(draftId);
        if (!draft) return;
        queryClient.setQueryData(["campaign-draft", draftId], draft);
        if (campaignSectionFingerprints(draft).pages === before) return;
        queueOrStartRecommendation("pages");
      } catch {
        // A follow-up the client did not ask for is not worth a toast: the rail still marks
        // the section as changed, and the next thing they say reads the draft anyway.
      }
    },
    [queryClient, queueOrStartRecommendation],
  );

  // Leaving the pages table — by closing the panel or by switching to another section — is
  // the one moment the edits are worth a look. A no-op when pages was not the open surface.
  const leavePagesSurface = () => {
    const before = workspaceSurface === "pages" ? pagesOnOpenRef.current : null;
    const draftId = activeDraftId;
    pagesOnOpenRef.current = null;
    // The panel closes immediately; the comparison happens behind it.
    if (before !== null && draftId)
      void checkPagesChangedOnClose(draftId, before);
  };

  const closeWorkspace = () => {
    leavePagesSurface();
    setWorkspaceSurface(null);
    setDialogueUnread(false);
    sessionStorage.removeItem(workspaceStorageKey(resolvedRole));
    window.setTimeout(() => textareaRef.current?.focus(), 0);
  };

  // Sections without an editor of their own just hand the conversation back: the
  // client says it in their own words instead of editing a canned sentence.
  const handleStepSelect = (action: CampaignSetupAction) => {
    if (action.kind === "surface") {
      openWorkspace(action.surface);
      return;
    }
    closeWorkspace();
  };

  const openedSurface = activeDraftId ? workspaceSurface : null;

  // Latest reply, kept visible above the composer while the surface covers the transcript.
  const lastReply = useMemo(() => {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      const message = messages[index];
      if (message.status === "success" && message.a)
        return toPlainText(message.a);
    }
    return null;
  }, [messages]);

  // Effects restore the isolated state after a role change. Hide the old role's
  // transcript for that single transition render so it is never flashed on screen.
  if (activeStateRole !== resolvedRole) return null;

  return (
    <Container className={styles.root}>
      <div
        className={`${styles.shell} ${activeDraftId ? styles.shellWide : ""}`}
      >
        <div
          className={`${styles.card} ${messages.length === 0 ? styles.cardEmpty : ""} ${
            isDraggingImage ? styles.cardImageDrop : ""
          }`}
          onDragOver={handleImageDragOver}
          onDragLeave={handleImageDragLeave}
          onDrop={handleImageDrop}
        >
          {activeDraftId && (
            <CampaignStepsRail
              draftId={activeDraftId}
              activeSurface={openedSurface}
              dialogueUnread={dialogueUnread}
              onSelect={handleStepSelect}
              onProceed={(id) => void handleOpenPayment(id)}
            />
          )}

          <div className={styles.stage}>
            <div className={styles.messages} ref={messagesRef}>
              {messages.length === 0 && !isPending && (
                <div className={styles.empty}>
                  <h3>
                    {role === "influencer"
                      ? "How can I help?"
                      : "Hi! How can I help today?"}
                  </h3>
                  <p>
                    {role === "influencer"
                      ? "Ask a question about SoundInfluencers and how to use the platform."
                      : "I can guide you through creating a campaign, help you find the right influencers, or answer questions about your account and invoices."}
                  </p>
                  <div className={styles.suggestions}>
                    {role === "client" && (
                      <button
                        type="button"
                        className={styles.exampleChip}
                        onClick={() => void handleStartCampaign()}
                        disabled={isStartingCampaign}
                      >
                        {isStartingCampaign
                          ? "Starting…"
                          : "Start guided campaign"}
                      </button>
                    )}
                    {campaignStartError && (
                      <p className={styles.startError} role="alert">
                        Couldn’t start the campaign. Please check your
                        connection and try again.
                      </p>
                    )}
                    <div className={styles.examples}>
                      {(role === "influencer"
                        ? INFLUENCER_EXAMPLE_PROMPTS
                        : CLIENT_EXAMPLE_PROMPTS
                      ).map((prompt) => (
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
                </div>
              )}

              {messages.map((msg) =>
                msg.note ? (
                  <div key={msg.id} className={styles.messageGroup}>
                    <button
                      type="button"
                      className={styles.noteChip}
                      onClick={() => openWorkspace(msg.note!.section)}
                    >
                      <span>{msg.note.text}</span>
                      <strong>Open {SECTION_LABELS[msg.note.section]} →</strong>
                    </button>
                  </div>
                ) : (
                  <div
                    key={msg.id}
                    className={`${styles.messageGroup} ${msg.assistantOnly ? styles.assistantOnly : ""}`}
                  >
                    {!msg.assistantOnly && (
                      <div className={styles.userRow}>
                        <div className={styles.userBubble}>
                          {msg.userImage && (
                            <img
                              className={styles.userImage}
                              src={msg.userImage.url}
                              alt={`Attached ${msg.userImage.name}`}
                            />
                          )}
                          <span>{msg.q}</span>
                        </div>
                      </div>
                    )}

                    <div className={styles.agentRow}>
                      {msg.status === "success" && (
                        <div
                          className={styles.agentBubble}
                          dangerouslySetInnerHTML={{
                            __html: sanitizeReply(msg.a),
                          }}
                        />
                      )}

                      {msg.status === "success" && msg.media.length > 0 && (
                        <div className={styles.generatedMedia}>
                          {msg.media.map((item) => (
                            <figure
                              key={item.url}
                              className={styles.generatedMediaCard}
                            >
                              <img src={item.url} alt={item.alt} />
                              <figcaption>
                                <span>Saved to this campaign’s Promo</span>
                                {item.draftId && (
                                  <button
                                    type="button"
                                    onClick={() => openWorkspace("promo")}
                                  >
                                    Open Promo →
                                  </button>
                                )}
                              </figcaption>
                            </figure>
                          ))}
                        </div>
                      )}

                      {msg.status === "error" && (
                        <div className={styles.errorBubble}>
                          <span>
                            {AGENT_ERROR_MESSAGES[msg.errorCode ?? "UNKNOWN"]}
                          </span>
                          {!NON_RETRYABLE_AGENT_ERRORS.has(
                            msg.errorCode ?? "UNKNOWN",
                          ) && (
                            <button
                              onClick={() => void handleRetry(msg)}
                              disabled={isPending || isPreparingSend}
                            >
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
                              const alreadyRendered = msg.links
                                .slice(0, k)
                                .some(
                                  (previousLink) =>
                                    getCampaignDraftId(previousLink) ===
                                    campaignDraftId,
                                );
                              if (alreadyRendered) return null;
                              // The table itself lives in the workspace — the conversation
                              // only keeps a marker of where the draft changed.
                              // A transcript restored from an older session can name a
                              // section that no longer exists; pages is the safe home.
                              const section: CampaignSetupSurface =
                                link.section === "strategy"
                                  ? "brief"
                                  : link.section &&
                                      link.section in SECTION_LABELS
                                    ? (link.section as CampaignSetupSurface)
                                    : "pages";
                              return (
                                <button
                                  key={campaignDraftId}
                                  type="button"
                                  className={
                                    msg.assistantOnly
                                      ? styles.inlineBriefLink
                                      : styles.draftChip
                                  }
                                  onClick={() => openWorkspace(section)}
                                >
                                  {msg.assistantOnly ? (
                                    <strong>
                                      Open {SECTION_LABELS[section]} →
                                    </strong>
                                  ) : (
                                    <>
                                      <span>{link.summary ?? link.label}</span>
                                      <strong>
                                        Open {SECTION_LABELS[section]} →
                                      </strong>
                                    </>
                                  )}
                                </button>
                              );
                            }

                            // Payment links open the in-chat checkout modal instead of navigating away.
                            if (link.kind === "payment" && link.draftId) {
                              return (
                                <button
                                  key={k}
                                  className={styles.payChip}
                                  disabled={isPending || isPreparingSend}
                                  onClick={() =>
                                    void handleOpenPayment(link.draftId!)
                                  }
                                >
                                  {link.label} →
                                </button>
                              );
                            }

                            return (
                              <Link
                                key={k}
                                to={withAiSource(link.path)}
                                className={styles.linkChip}
                              >
                                {link.label} →
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ),
              )}

              {isPending && (
                <div className={styles.thinking}>
                  Thinking
                  <span />
                  <span />
                  <span />
                </div>
              )}
            </div>

            {activeDraftId && openedSurface && (
              <div className={styles.workspaceLayer}>
                <CampaignWorkspacePanel
                  draftId={activeDraftId}
                  surface={openedSurface}
                  onClose={closeWorkspace}
                  onGoToChat={closeWorkspace}
                  onProceedToPayment={(id) => void handleOpenPayment(id)}
                  onNote={addNote}
                  onBriefReady={handleBriefReady}
                  recommendations={recommendationsByDraft[activeDraftId]}
                  onRequestMoreRecommendations={handleMoreRecommendations}
                />
              </div>
            )}
          </div>

          {openedSurface && (
            <button
              // Remounting on a new reply replays the highlight, so an answer that
              // arrives while the surface is open does not go unnoticed.
              key={isPending ? "pending" : (lastReply ?? "none")}
              type="button"
              className={styles.replyStrip}
              onClick={closeWorkspace}
            >
              <span className={styles.replyStripLabel}>
                {isPending ? "Assistant" : "Latest reply"}
              </span>
              <span className={styles.replyStripText}>
                {isPending
                  ? "Thinking…"
                  : (lastReply ??
                    "Ask the assistant anything while you work here.")}
              </span>
              <span className={styles.replyStripAction}>Show conversation</span>
            </button>
          )}

          {sendPreparationError && (
            <div className={styles.saveBeforeSendError} role="alert">
              Campaign changes could not be saved. Retry sending after the
              connection recovers.
            </div>
          )}

          {attachmentError && (
            <div className={styles.attachmentError} role="alert">
              <span>{attachmentError}</span>
              <button
                type="button"
                onClick={() => setAttachmentError(null)}
                aria-label="Dismiss image error"
              >
                ×
              </button>
            </div>
          )}

          <div className={styles.inputArea}>
            {isDraggingImage && (
              <div className={styles.dropHint} aria-hidden="true">
                Drop the image to edit it in this campaign
              </div>
            )}
            {attachment && (
              <div className={styles.attachmentPreview}>
                <img src={attachment.previewUrl} alt="Promo source preview" />
                <div>
                  <strong>{attachment.file.name}</strong>
                  <span>
                    {attachment.resized
                      ? "Resized to fit the image service. Describe how the assistant should turn it into a promo."
                      : "Describe how the assistant should turn it into a promo."}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={removeAttachment}
                  aria-label="Remove attached image"
                >
                  ×
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              className={styles.hiddenFileInput}
              type="file"
              accept={ACCEPTED_IMAGE_ACCEPT}
              onChange={(event) =>
                void chooseAttachment(event.target.files?.[0])
              }
            />
            {role === "client" && (
              <button
                type="button"
                className={`${styles.attachButton} ${
                  isInspectingAttachment ? styles.attachButtonBusy : ""
                }`}
                onClick={() => {
                  if (!activeDraftId) {
                    setAttachmentError(
                      "Start or open a campaign before adding a promo image.",
                    );
                    return;
                  }
                  fileInputRef.current?.click();
                }}
                disabled={
                  isPending || isPreparingSend || isInspectingAttachment
                }
                aria-label={
                  isInspectingAttachment
                    ? "Checking the attached image"
                    : "Attach an image for promo editing"
                }
                title={
                  isInspectingAttachment
                    ? "Checking the image…"
                    : `Attach JPG, PNG or WebP (${MAX_PROMO_IMAGE_MB} MB max)`
                }
              >
                <img className={styles.attachIcon} src={imageIcon} alt="" />
              </button>
            )}
            <textarea
              ref={textareaRef}
              className={styles.textarea}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isPending || isPreparingSend || isInspectingAttachment}
              rows={1}
              placeholder="Type your message…"
            />
            <button
              className={styles.sendButton}
              onClick={() => void handleSend()}
              disabled={
                isPending ||
                isPreparingSend ||
                isInspectingAttachment ||
                !input.trim()
              }
            >
              {isPending ? "Thinking…" : isPreparingSend ? "Saving…" : "Send"}
            </button>
            <button
              className={styles.resetButton}
              onClick={handleReset}
              disabled={isPending || isPreparingSend}
            >
              New conversation
            </button>
          </div>
        </div>
      </div>

      {paymentDraftId && (
        <AiPaymentModal
          draftId={paymentDraftId}
          onClose={() => setPaymentDraftId(null)}
        />
      )}
    </Container>
  );
};
