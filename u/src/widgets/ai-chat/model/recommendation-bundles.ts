import type {
  AgentLink,
  AgentSearchBundle,
  AgentSearchCandidate,
} from "@/api/agent/agent.api.ts";

export const MAX_DRAFT_ACCOUNT_COUNT = 50;

export const getRecommendationBundleLabel = (name: string) => {
  if (name === "best_value") return "Best value";
  if (name === "max_reach") return "Maximum reach";
  return name;
};

export const resolveSearchDraftId = (
  requestDraftId: string | undefined,
  responseLinks: readonly AgentLink[],
) => {
  if (requestDraftId) return requestDraftId;
  for (const link of responseLinks) {
    if (link.kind === "campaign_draft" && link.draftId) return link.draftId;
    const pathDraftId =
      /^\/client\/campaign-draft\/([a-f\d]{24})$/i.exec(link.path)?.[1];
    if (pathDraftId) return pathDraftId;
  }
  return undefined;
};

export type RecommendationBundleResolution<T> = {
  status: "ready" | "already-added" | "missing-candidates" | "over-capacity";
  candidates: T[];
  memberNames: string[];
  missingAccountIds: string[];
  alreadyAddedCount: number;
  remainingCapacity: number;
};

export const resolveRecommendationBundle = <
  T extends Pick<AgentSearchCandidate, "accountId" | "username">,
>(
  bundle: AgentSearchBundle,
  candidates: readonly T[],
  existingAccountIds: ReadonlySet<string>,
  draftAccountCount: number,
): RecommendationBundleResolution<T> => {
  const candidatesById = new Map(
    candidates.map((candidate) => [candidate.accountId, candidate]),
  );
  const uniqueAccountIds = [...new Set(bundle.accountIds)];
  const missingAccountIds = uniqueAccountIds.filter(
    (accountId) => !candidatesById.has(accountId),
  );
  const memberNames = uniqueAccountIds.map(
    (accountId) => candidatesById.get(accountId)?.username ?? "Unavailable page",
  );
  const alreadyAddedCount = uniqueAccountIds.filter((accountId) =>
    existingAccountIds.has(accountId),
  ).length;
  const bundleCandidates = uniqueAccountIds
    .filter((accountId) => !existingAccountIds.has(accountId))
    .map((accountId) => candidatesById.get(accountId))
    .filter((candidate): candidate is T => Boolean(candidate));
  const remainingCapacity = Math.max(
    0,
    MAX_DRAFT_ACCOUNT_COUNT - draftAccountCount,
  );

  const status = missingAccountIds.length
    ? "missing-candidates"
    : bundleCandidates.length === 0
      ? "already-added"
      : bundleCandidates.length > remainingCapacity
        ? "over-capacity"
        : "ready";

  return {
    status,
    candidates: bundleCandidates,
    memberNames,
    missingAccountIds,
    alreadyAddedCount,
    remainingCapacity,
  };
};
