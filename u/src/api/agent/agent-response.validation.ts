import type { AgentChatResponse, AgentSearchOutcome } from "./agent.api.ts";

const record = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const string = (value: unknown): value is string => typeof value === "string";
const strings = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(string);
const number = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;
const optionalString = (value: unknown) => value === undefined || string(value);
const currency = (value: unknown) =>
  value === "EUR" || value === "USD" || value === "GBP";

export const isAgentSearchOutcome = (value: unknown): value is AgentSearchOutcome => {
  if (
    !record(value) ||
    !["completed", "empty", "failed"].includes(String(value.status)) ||
    !number(value.page) ||
    !number(value.loadedCount) ||
    !number(value.totalExact) ||
    typeof value.hasMore !== "boolean" ||
    (value.nextPage !== undefined && !number(value.nextPage)) ||
    !Array.isArray(value.candidates)
  )
    return false;
  if (
    !value.candidates.every(
      (candidate) =>
        record(candidate) &&
        ["accountId", "influencerId", "username", "socialMedia"].every((key) =>
          string(candidate[key]),
        ) &&
        optionalString(candidate.logoUrl) &&
        number(candidate.followers) &&
        number(candidate.priceEUR) &&
        number(candidate.price) &&
        currency(candidate.currency) &&
        (candidate.profileType === "creator" || candidate.profileType === "community") &&
        strings(candidate.musicGenres) &&
        (candidate.countryShare === undefined || number(candidate.countryShare)),
    )
  )
    return false;
  return (
    value.bundles === undefined ||
    (Array.isArray(value.bundles) &&
      value.bundles.every(
        (bundle) =>
          record(bundle) &&
          string(bundle.id) &&
          string(bundle.name) &&
          number(bundle.total) &&
          currency(bundle.currency) &&
          strings(bundle.accountIds),
      ))
  );
};

export const isAgentChatResponse = (value: unknown): value is AgentChatResponse =>
  record(value) &&
  strings(value.steps) &&
  string(value.reply) &&
  string(value.conversationId) &&
  Array.isArray(value.links) &&
  value.links.every(
    (link) =>
      record(link) &&
      string(link.label) &&
      string(link.path) &&
      optionalString(link.kind) &&
      optionalString(link.draftId) &&
      optionalString(link.summary) &&
      (link.section === undefined ||
        ["brief", "strategy", "pages", "content", "promo"].includes(
          String(link.section),
        )),
  ) &&
  (value.search === undefined || isAgentSearchOutcome(value.search)) &&
  (value.media === undefined ||
    (Array.isArray(value.media) &&
      value.media.every(
        (media) =>
          record(media) &&
          media.type === "image" &&
          string(media.url) &&
          string(media.alt) &&
          optionalString(media.draftId),
      )));
