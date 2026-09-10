export type AiChatRole = "client" | "influencer";

export interface AiChatIdentity {
  userId: string;
  role: AiChatRole;
}

interface BrowserStorage {
  getItem(key: string): string | null;
  removeItem(key: string): void;
  setItem(key: string, value: string): void;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const isOptionalString = (value: unknown) =>
  value === undefined || typeof value === "string";

export const isAiChatPersistedState = (
  value: unknown,
): value is Record<string, unknown> & { messages: Record<string, unknown>[] } => {
  if (!isRecord(value) || !Array.isArray(value.messages)) return false;
  if (
    !isOptionalString(value.conversationId) ||
    !isOptionalString(value.activeDraftId) ||
    !isOptionalString(value.role)
  ) {
    return false;
  }
  if (value.recommendationsByDraft !== undefined) {
    if (!isRecord(value.recommendationsByDraft)) return false;
    const validRecommendations = Object.values(
      value.recommendationsByDraft,
    ).every(
      (outcome) =>
        isRecord(outcome) &&
        Array.isArray(outcome.candidates) &&
        (outcome.bundles === undefined || Array.isArray(outcome.bundles)),
    );
    if (!validRecommendations) return false;
  }
  return value.messages.every(
    (message) =>
      isRecord(message) &&
      typeof message.id === "string" &&
      typeof message.q === "string" &&
      typeof message.a === "string" &&
      Array.isArray(message.links) &&
      message.links.every(
        (link) =>
          isRecord(link) &&
          typeof link.label === "string" &&
          typeof link.path === "string",
      ) &&
      Array.isArray(message.media) &&
      message.media.every(
        (media) =>
          isRecord(media) &&
          media.type === "image" &&
          typeof media.url === "string" &&
          typeof media.alt === "string",
      ) &&
      (message.note === undefined ||
        (isRecord(message.note) &&
          typeof message.note.text === "string" &&
          typeof message.note.section === "string")) &&
      (message.userImage === undefined ||
        (isRecord(message.userImage) &&
          typeof message.userImage.url === "string" &&
          typeof message.userImage.name === "string")) &&
      (message.status === "pending" ||
        message.status === "success" ||
        message.status === "error"),
  );
};

const CHAT_KEY_PREFIX = "ai-chat:v4";
const WORKSPACE_KEY_PREFIX = "ai-chat:workspace-surface:v2";
const LEGACY_CHAT_KEY_PREFIX = "ai-chat:v3";
const LEGACY_WORKSPACE_KEY_PREFIX = "ai-chat:workspace-surface";

const discardLegacyAiChatPersistence = (storage: BrowserStorage) => {
  for (const role of ["client", "influencer"] as const) {
    storage.removeItem(`${LEGACY_CHAT_KEY_PREFIX}:${role}`);
    storage.removeItem(`${LEGACY_WORKSPACE_KEY_PREFIX}:${role}`);
  }
};

const identitySuffix = (identity: AiChatIdentity) =>
  `${encodeURIComponent(identity.userId)}:${identity.role}`;

export const aiChatStorageKey = (identity: AiChatIdentity) =>
  `${CHAT_KEY_PREFIX}:${identitySuffix(identity)}`;

export const aiChatWorkspaceStorageKey = (identity: AiChatIdentity) =>
  `${WORKSPACE_KEY_PREFIX}:${identitySuffix(identity)}`;

export const identityFromAccessToken = (
  accessToken: string | null,
): AiChatIdentity | null => {
  if (!accessToken) return null;
  try {
    const payloadPart = accessToken.split(".")[1];
    if (!payloadPart) return null;
    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );
    const payload = JSON.parse(atob(padded)) as {
      sub?: unknown;
      _id?: unknown;
      role?: unknown;
    };
    const userId = payload.sub ?? payload._id;
    if (
      typeof userId !== "string" ||
      !userId ||
      (payload.role !== "client" && payload.role !== "influencer")
    ) {
      return null;
    }
    return { userId, role: payload.role };
  } catch {
    return null;
  }
};

export const readAiChatState = <T>(
  storage: BrowserStorage,
  identity: AiChatIdentity | null,
  validate?: (value: unknown) => value is T,
): T | null => {
  if (!identity) return null;
  try {
    discardLegacyAiChatPersistence(storage);
    const key = aiChatStorageKey(identity);
    const raw = storage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed) ||
      (validate && !validate(parsed))
    ) {
      storage.removeItem(key);
      return null;
    }
    return parsed as T;
  } catch {
    try {
      storage.removeItem(aiChatStorageKey(identity));
    } catch {
      // Storage can be unavailable in private or restricted browsing modes.
    }
    return null;
  }
};

export const writeAiChatState = <T>(
  storage: BrowserStorage,
  identity: AiChatIdentity | null,
  state: T,
) => {
  if (!identity) return;
  try {
    discardLegacyAiChatPersistence(storage);
    storage.setItem(aiChatStorageKey(identity), JSON.stringify(state));
  } catch {
    // Persistence is helpful but must never prevent chat use.
  }
};

export const removeAiChatState = (
  storage: BrowserStorage,
  identity: AiChatIdentity | null,
) => {
  if (!identity) return;
  try {
    storage.removeItem(aiChatStorageKey(identity));
  } catch {
    // Persistence is helpful but must never prevent chat use.
  }
};

export const readAiWorkspaceSurface = (
  storage: BrowserStorage,
  identity: AiChatIdentity | null,
): string | null => {
  if (!identity) return null;
  try {
    discardLegacyAiChatPersistence(storage);
    return storage.getItem(aiChatWorkspaceStorageKey(identity));
  } catch {
    return null;
  }
};

export const writeAiWorkspaceSurface = (
  storage: BrowserStorage,
  identity: AiChatIdentity | null,
  surface: string | null,
) => {
  if (!identity) return;
  try {
    discardLegacyAiChatPersistence(storage);
    const key = aiChatWorkspaceStorageKey(identity);
    if (surface === null) storage.removeItem(key);
    else storage.setItem(key, surface);
  } catch {
    // Persistence is helpful but must never prevent workspace use.
  }
};

export const clearAiChatPersistence = (
  storage: BrowserStorage,
  identity: AiChatIdentity | null,
) => {
  if (!identity) return;
  try {
    discardLegacyAiChatPersistence(storage);
    storage.removeItem(aiChatStorageKey(identity));
    storage.removeItem(aiChatWorkspaceStorageKey(identity));
  } catch {
    // Logout must continue even when storage is unavailable.
  }
};
