import type {
  AgentSearchCandidate,
  AgentSearchOutcome,
} from "@/api/agent/agent.api.ts";
import type { DraftAddedAccountDto } from "@/entities/client-side/campaign-draft/api/campaign-draft.dto.ts";
import {
  formatCompactNumber,
  normalizeDraftPlatform,
} from "@/entities/client-side/campaign-draft/model/ai-campaign-draft.model.ts";
import { formatSearchPrice } from "../model/campaign-selection.ts";
import styles from "./ai-campaign-draft-card.module.scss";

type Props = {
  search: AgentSearchOutcome;
  accounts: DraftAddedAccountDto[];
  busy: boolean;
  onToggle: (candidate: AgentSearchCandidate) => void;
  onAddBundle: (pages: AgentSearchCandidate[]) => void;
  onLoadMore: () => void;
  onEditBrief: () => void;
  onRetry: () => void;
};

export const CampaignRecommendations = ({
  search,
  accounts,
  busy,
  onToggle,
  onAddBundle,
  onLoadMore,
  onEditBrief,
  onRetry,
}: Props) => {
  const byId = new Map(
    accounts.map((account) => [String(account.socialAccountId), account]),
  );
  const bundles = (search.bundles ?? []).map(bundle => {
    const pages = bundle.pages ?? bundle.accountIds.map(id => search.candidates.find(page => page.accountId === id)).filter((page): page is AgentSearchCandidate => Boolean(page));
    return { ...bundle, pages, complete: pages.length === bundle.accountIds.length, followers: bundle.followers ?? pages.reduce((sum, page) => sum + page.followers, 0) };
  });
  const countries = search.countries?.join(", ");
  const audienceHint = countries
    ? `Combined audience share in ${countries}. This describes geography, not music taste or predicted views.`
    : "Audience share in the countries used for this search. Not a genre match or predicted views.";
  return (
    <section
      className={styles.recommendations}
      aria-label="AI page recommendations"
    >
      <header className={styles.recommendationsHeader}>
        <div>
          <span className={styles.eyebrow}>Page recommendations</span>
          <h4>
            {search.status === "completed"
              ? `${search.totalExact} matching pages · ${search.candidates.length} loaded`
              : search.status === "empty"
                ? "No matching pages found"
                : "Page search did not complete"}
          </h4>
        </div>
        <span>
          Select a page to include it. Your selection saves automatically.
        </span>
      </header>
      {search.status === "completed" && (
        <>
          {!!bundles.length && (
            <div className={styles.bundleGrid}>
              {bundles.map((bundle) => {
                const included = bundle.pages.every((page) => {
                  const saved = byId.get(page.accountId);
                  return (
                    saved &&
                    saved.isSelected !== false &&
                    saved.isAvailable !== false
                  );
                });
                return (
                  <article className={styles.bundleCard} key={bundle.id}>
                    <header>
                      <strong>
                        {bundle.name === "best_value"
                          ? "Recommended value"
                          : "Larger audience"}
                      </strong>
                      <strong>
                        {formatSearchPrice(bundle.total, bundle.currency)}
                      </strong>
                    </header>
                    <p>
                      {bundle.pages.length} pages ·{" "}
                      {formatCompactNumber(bundle.followers)} combined followers
                    </p>
                    <details>
                      <summary>View all {bundle.pages.length} pages</summary>
                      <ul>
                        {bundle.pages.map((page) => (
                          <li key={page.accountId}>
                            <span>
                              <strong>{page.username}</strong>
                              <small>
                                {normalizeDraftPlatform(page.socialMedia)} ·{" "}
                                {formatCompactNumber(page.followers)} followers
                                {typeof page.countryShare === "number"
                                  ? ` · ${page.countryShare}% in selected countries`
                                  : ""}
                              </small>
                            </span>
                            <b>
                              {formatSearchPrice(page.price, page.currency)}
                            </b>
                          </li>
                        ))}
                      </ul>
                    </details>
                    <button
                      type="button"
                      disabled={included || busy || !bundle.complete}
                      onClick={() => onAddBundle(bundle.pages)}
                    >
                      {included
                        ? "Included in your selection"
                        : `Include these ${bundle.pages.length} pages`}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
          <p className={styles.audienceExplanation}>
            {countries
              ? `Audience in ${countries}: percentages describe geography, not genre affinity.`
              : search.countries?.length === 0
                ? "Worldwide search: no country restriction."
                : "Audience percentages describe the search countries, not genre affinity."}{" "}
            Followers can overlap between pages.
          </p>
          <div className={styles.recommendationList}>
            {search.candidates.map((candidate) => {
              const saved = byId.get(candidate.accountId);
              const unavailable = saved?.isAvailable === false;
              const selected = Boolean(
                saved && saved.isSelected !== false && !unavailable,
              );
              return (
                <label
                  key={candidate.accountId}
                  className={`${styles.recommendationRow} ${selected ? styles.recommendationIncluded : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    disabled={unavailable}
                    onChange={() => onToggle(candidate)}
                    aria-label={`Include ${candidate.username}`}
                  />
                  {candidate.logoUrl ? (
                    <img src={candidate.logoUrl} alt="" />
                  ) : (
                    <span className={styles.recommendationAvatar} />
                  )}
                  <span className={styles.recommendationName}>
                    <strong>{candidate.username}</strong>
                    <small>
                      {normalizeDraftPlatform(candidate.socialMedia)} ·{" "}
                      {candidate.musicGenres?.join(", ") ||
                        "Genre not specified"}
                    </small>
                  </span>
                  <span className={styles.recommendationMetric}>
                    <strong>{formatCompactNumber(candidate.followers)}</strong>
                    <small>followers</small>
                  </span>
                  <span
                    className={styles.recommendationMetric}
                    title={audienceHint}
                  >
                    <strong>
                      {typeof candidate.countryShare === "number"
                        ? `${candidate.countryShare}%`
                        : "—"}
                    </strong>
                    <small>in selected countries</small>
                  </span>
                  <span className={styles.recommendationPrice}>
                    {formatSearchPrice(candidate.price, candidate.currency)}
                    {unavailable && <small>Unavailable</small>}
                  </span>
                </label>
              );
            })}
          </div>
        </>
      )}
      <footer className={styles.recommendationsFooter}>
        <span>
          {search.status === "empty"
            ? "Your brief is saved. Adjust the genre, countries or budget to search again."
            : search.status === "failed"
              ? "Your brief is saved. Retry the search when you are ready."
              : search.hasMore
                ? "The packages above use the full matching roster. More individual pages are available below."
                : "All matching pages are loaded."}
        </span>
        <div>
          {search.status === "empty" && (
            <button type="button" onClick={onEditBrief}>
              Adjust brief
            </button>
          )}
          {search.status === "failed" && (
            <button type="button" disabled={busy} onClick={onRetry}>
              Retry search
            </button>
          )}
          {search.hasMore && (
            <button
              type="button"
              className={styles.secondary}
              disabled={busy}
              onClick={onLoadMore}
            >
              {busy ? "Loading…" : "Load more pages"}
            </button>
          )}
        </div>
      </footer>
    </section>
  );
};
