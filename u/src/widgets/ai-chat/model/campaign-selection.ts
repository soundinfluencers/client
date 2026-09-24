import type {
  AgentSearchCandidate,
  AgentSearchOutcome,
} from "@/api/agent/agent.api.ts";
import type { DraftAddedAccountDto } from "@/entities/client-side/campaign-draft/api/campaign-draft.dto.ts";

export const formatSearchPrice = (amount: number, currency = "EUR") =>
  new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);

export const getRecommendedDate = (date?: string) =>
  !date?.trim() || /^(flexible|asap)$/i.test(date.trim())
    ? "ASAP"
    : date.trim();

export const getRecommendationCandidates = (search?: AgentSearchOutcome) => {
  const byId = new Map<string, AgentSearchCandidate>();
  for (const candidate of [
    ...(search?.candidates ?? []),
    ...(search?.bundles ?? []).flatMap((bundle) => (bundle.pages ?? [])),
  ]) {
    if (!byId.has(candidate.accountId))
      byId.set(candidate.accountId, candidate);
  }
  return [...byId.values()];
};

export const includeRecommendedPages = (
  accounts: DraftAddedAccountDto[],
  pages: AgentSearchCandidate[],
  date?: string,
): DraftAddedAccountDto[] => {
  const requested = new Set(pages.map((page) => page.accountId));
  const byId = new Map(
    accounts.map((account) => [
      String(account.socialAccountId),
      {
        ...account,
        ...(requested.has(String(account.socialAccountId)) &&
        account.isAvailable !== false
          ? { isSelected: true }
          : {}),
      },
    ]),
  );
  for (const page of pages) {
    if (byId.has(page.accountId)) continue;
    byId.set(page.accountId, {
      influencerId: page.influencerId,
      socialAccountId: page.accountId,
      socialMedia: page.socialMedia,
      username: page.username,
      logoUrl: page.logoUrl,
      followers: page.followers,
      price: page.priceEUR,
      dateRequest: getRecommendedDate(date),
      isSelected: true,
      isAvailable: true,
      profileType: page.profileType,
    });
  }
  return [...byId.values()];
};

export const getSelectionTotals = (
  accounts: DraftAddedAccountDto[],
  pending: AgentSearchCandidate[] = [],
) => {
  const selected = includeRecommendedPages(accounts, pending).filter(
    (account) => account.isSelected !== false && account.isAvailable !== false,
  );
  return {
    count: selected.length,
    priceEUR: selected.reduce(
      (sum, account) => sum + Number(account.price ?? 0),
      0,
    ),
    followers: selected.reduce(
      (sum, account) => sum + Number(account.followers ?? 0),
      0,
    ),
  };
};

export const getConvertedSelectionTotal = (
  accounts: DraftAddedAccountDto[],
  search: AgentSearchOutcome | undefined,
  currency: "EUR" | "GBP" | "USD",
): number | undefined => {
  if (currency === "EUR") return getSelectionTotals(accounts).priceEUR;
  if (
    search?.currency !== currency ||
    !search.currencyPerEUR ||
    search.currencyPerEUR <= 0
  )
    return undefined;
  const rate = search.currencyPerEUR;
  const candidates = new Map(
    getRecommendationCandidates(search).map((candidate) => [
      candidate.accountId,
      candidate,
    ]),
  );
  return accounts
    .filter(
      (account) =>
        account.isSelected !== false && account.isAvailable !== false,
    )
    .reduce((sum, account) => {
      const candidate = candidates.get(String(account.socialAccountId));
      const priceEUR = Number(account.price ?? 0);
      return (
        sum +
        (candidate?.currency === currency && candidate.priceEUR === priceEUR
          ? candidate.price
          : Math.round((priceEUR * rate + Number.EPSILON) * 100) / 100)
      );
    }, 0);
};

export const mergeSearchOutcome = (
  current: AgentSearchOutcome | undefined,
  incoming: AgentSearchOutcome,
): AgentSearchOutcome => {
  if (!current || incoming.page <= 1) return incoming;
  if (incoming.status === "empty") {
    return {
      ...current,
      hasMore: false,
      nextPage: undefined,
      totalExact: Math.max(current.totalExact, incoming.totalExact),
    };
  }
  if (incoming.status === "failed") return current;
  const byId = new Map(
    current.candidates.map((candidate) => [candidate.accountId, candidate]),
  );
  incoming.candidates.forEach((candidate) =>
    byId.set(candidate.accountId, candidate),
  );
  const candidates = [...byId.values()];
  return {
    ...current,
    ...incoming,
    candidates,
    loadedCount: candidates.length,
  };
};
