import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { getCampaignFilters } from "@/entities/client-side/campaign-creator-page/campaign-filter/api/campaign-filter.api.ts";
import type {
  CampaignFilterItem,
  CampaignFilterSection,
} from "@/entities/client-side/campaign-creator-page/campaign-filter/model/campaign-filter.types.ts";
import {
  CampaignDraftConflictError,
  saveCampaignDraftBrief,
} from "@/entities/client-side/campaign-draft/api/campaign-draft.api.ts";
import type {
  CampaignBriefDto,
  CampaignDraftDto,
} from "@/entities/client-side/campaign-draft/api/campaign-draft.dto.ts";
import {
  getMissingRequiredBriefFields,
  isRequiredBriefComplete,
} from "@/entities/client-side/campaign-setup/model/campaign-brief-readiness.ts";
import type { CampaignSetupSurface } from "@/entities/client-side/campaign-setup/model/campaign-setup.model.ts";

import styles from "./campaign-plan-section.module.scss";

interface Props {
  draft: CampaignDraftDto;
  onSaved: (text: string, section: CampaignSetupSurface) => void;
  onGoToChat: () => void;
  onBriefReady: () => void;
}

type SelectOption = { value: string; label: string };

const EMPTY_BRIEF: CampaignBriefDto = {
  budgetCurrency: "EUR",
  contentAvailability: "unknown",
  platforms: [],
  countries: [],
};

const EMPTY_FILTER_REQUEST = {
  socialMedias: [],
  profileTypes: [],
  countries: [],
  communityMusicGenres: [],
  communityThemeTopics: [],
  creatorMusicGenres: [],
  creatorContentFocus: [],
};

const briefFromDraft = (draft: CampaignDraftDto): CampaignBriefDto => ({
  ...EMPTY_BRIEF,
  budget: draft.brief?.budget,
  budgetCurrency: draft.brief?.budgetCurrency ?? "EUR",
  campaignGoal: draft.brief?.campaignGoal,
  contentAvailability: draft.brief?.contentAvailability ?? "unknown",
  platforms: draft.brief?.platforms ?? [],
  countries: draft.brief?.countries ?? [],
  dateRequest: draft.brief?.dateRequest,
  genre: draft.brief?.genre,
  // Existing drafts stored this in a separate strategy object. Showing it here
  // migrates it into the brief the next time the client saves.
  contentStrategy: draft.brief?.contentStrategy ?? draft.strategy?.contentStrategy,
  trackName: draft.brief?.trackName,
  additionalContext: draft.brief?.additionalContext,
});

const flattenItems = (items: CampaignFilterItem[]): CampaignFilterItem[] =>
  items.flatMap((item) => [item, ...flattenItems(item.children ?? [])]);

const optionsFor = (
  sections: CampaignFilterSection[] | undefined,
  match: (section: CampaignFilterSection) => boolean,
): SelectOption[] => {
  const section = sections?.find(match);
  if (!section) return [];

  const byValue = new Map<string, SelectOption>();
  flattenItems(section.filters).forEach((item) => {
    const value = String(item.apiValue || item.rawId || item.id).trim();
    const label = String(item.filterName || value).trim();
    if (value && label && !byValue.has(value)) byValue.set(value, { value, label });
  });
  return [...byValue.values()];
};

const withCurrentValues = (options: SelectOption[], values: string[]) => {
  const known = new Set(options.map((option) => option.value));
  return [
    ...options,
    ...values.filter((value) => value && !known.has(value)).map((value) => ({ value, label: value })),
  ];
};

interface MultiSelectProps {
  label: string;
  placeholder: string;
  options: SelectOption[];
  values: string[];
  loading?: boolean;
  onChange: (values: string[]) => void;
}

const MultiSelect = ({ label, placeholder, options, values, loading, onChange }: MultiSelectProps) => {
  const [search, setSearch] = useState("");
  const labels = new Map(options.map((option) => [option.value, option.label]));
  const visible = options.filter((option) =>
    `${option.label} ${option.value}`.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const toggle = (value: string) => {
    onChange(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  };

  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      <details className={styles.multiSelect}>
        <summary>
          <span className={values.length ? styles.selectedSummary : styles.placeholder}>
            {values.length
              ? values.map((value) => labels.get(value) ?? value).join(", ")
              : loading
                ? "Loading options…"
                : placeholder}
          </span>
          <i aria-hidden="true" />
        </summary>
        <div className={styles.multiMenu}>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`Search ${label.toLowerCase()}`}
            aria-label={`Search ${label.toLowerCase()}`}
          />
          <div className={styles.optionList}>
            {visible.map((option) => (
              <label key={option.value} className={styles.option}>
                <input type="checkbox" checked={values.includes(option.value)} onChange={() => toggle(option.value)} />
                <span>{option.label}</span>
              </label>
            ))}
            {!loading && visible.length === 0 && <span className={styles.noOptions}>No matching options</span>}
          </div>
        </div>
      </details>
    </div>
  );
};

export const CampaignPlanSection = ({ draft, onSaved, onGoToChat, onBriefReady }: Props) => {
  const queryClient = useQueryClient();
  const [campaignName, setCampaignName] = useState(draft.campaignName ?? "");
  const [brief, setBrief] = useState<CampaignBriefDto>(() => briefFromDraft(draft));
  const [additionalOpen, setAdditionalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const filters = useQuery({
    queryKey: ["campaign-brief-options"],
    queryFn: () => getCampaignFilters(EMPTY_FILTER_REQUEST),
    staleTime: 5 * 60 * 1000,
  });

  const platformOptions = useMemo(
    () =>
      withCurrentValues(
        optionsFor(
          filters.data,
          (section) => section.id.includes("social-platform") || /platform/i.test(section.title),
        ),
        brief.platforms ?? [],
      ),
    [brief.platforms, filters.data],
  );
  const countryOptions = useMemo(
    () =>
      withCurrentValues(
        [
          { value: "Worldwide", label: "Worldwide / no country restriction" },
          ...optionsFor(filters.data, (section) => section.id === "countries"),
        ],
        brief.countries ?? [],
      ),
    [brief.countries, filters.data],
  );
  const genreOptions = useMemo(
    () =>
      withCurrentValues(
        optionsFor(filters.data, (section) => section.id === "music-genre" || /music genre/i.test(section.title)),
        brief.genre ? [brief.genre] : [],
      ),
    [brief.genre, filters.data],
  );

  useEffect(() => {
    setCampaignName(draft.campaignName ?? "");
    setBrief(briefFromDraft(draft));
  }, [draft]);

  useEffect(() => setAdditionalOpen(false), [draft._id]);

  useEffect(() => setStatus(null), [draft._id]);

  const save = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const result = await saveCampaignDraftBrief(draft._id, Number(draft.revision ?? 0), brief, campaignName.trim());
      const savedCampaignName = campaignName.trim() || draft.campaignName || "Untitled campaign";

      queryClient.setQueryData<CampaignDraftDto>(["campaign-draft", draft._id], (current) => ({
        ...(current ?? draft),
        revision: result.revision,
        campaignName: savedCampaignName,
        brief,
      }));
      setCampaignName(savedCampaignName);
      setStatus("Saved");
      onSaved("Brief saved", "brief");
      const missingRequired = getMissingRequiredBriefFields(brief);
      if (isRequiredBriefComplete(brief)) {
        toast.success("Brief saved. Finding matching pages…");
        onBriefReady();
      } else {
        toast.info(
          `Brief saved. Complete ${missingRequired.length} required ${
            missingRequired.length === 1 ? "answer" : "answers"
          } before page search.`,
        );
      }
    } catch (error) {
      setStatus(
        error instanceof CampaignDraftConflictError
          ? "This campaign changed elsewhere. Reload it and try again."
          : "Could not save this section. Try again.",
      );
      toast.error("Could not save the brief. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const dateValue = /^\d{4}-\d{2}-\d{2}$/.test(brief.dateRequest ?? "") ? brief.dateRequest : "";
  const savedCustomDate =
    brief.dateRequest && brief.dateRequest !== "Flexible" && !dateValue ? brief.dateRequest : null;

  return (
    <div className={styles.form}>
      <div className={styles.intro}>
        <strong>Complete the short brief before we find pages.</strong>
        <span>
          Core planning answers are required. Additional details stay optional, and you can return to change anything
          later.
        </span>
        <button type="button" onClick={onGoToChat}>
          Continue in Dialogue
        </button>
      </div>

      <label className={styles.full}>
        <span>
          Campaign goal <small>Required</small>
        </span>
        <textarea
          value={brief.campaignGoal ?? ""}
          onChange={(event) =>
            setBrief((current) => ({
              ...current,
              campaignGoal: event.target.value,
            }))
          }
          placeholder="What should this campaign achieve?"
        />
      </label>

      <div className={styles.grid}>
        <label>
          <span>
            Budget <small>Required · approximate</small>
          </span>
          <div className={styles.inline}>
            <input
              type="number"
              min="0"
              value={brief.budget ?? ""}
              onChange={(event) =>
                setBrief((current) => ({
                  ...current,
                  budget: event.target.value ? Number(event.target.value) : undefined,
                }))
              }
            />
            <select
              value={brief.budgetCurrency ?? "EUR"}
              onChange={(event) =>
                setBrief((current) => ({
                  ...current,
                  budgetCurrency: event.target.value as CampaignBriefDto["budgetCurrency"],
                }))
              }
            >
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </label>

        <label>
          <span>
            Song genre <small>Required</small>
          </span>
          <select
            value={brief.genre ?? ""}
            onChange={(event) =>
              setBrief((current) => ({
                ...current,
                genre: event.target.value || undefined,
              }))
            }
          >
            <option value="">{filters.isPending ? "Loading genres…" : "Choose a genre"}</option>
            {genreOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <MultiSelect
          label="Platforms · Required"
          placeholder="Choose platforms"
          options={platformOptions}
          values={brief.platforms ?? []}
          loading={filters.isPending}
          onChange={(platforms) => setBrief((current) => ({ ...current, platforms }))}
        />

        <MultiSelect
          label="Countries · Required"
          placeholder="Choose countries"
          options={countryOptions}
          values={brief.countries ?? []}
          loading={filters.isPending}
          onChange={(countries) => setBrief((current) => ({ ...current, countries }))}
        />

        <label>
          <span>
            Campaign date <small>Required unless Flexible</small>
          </span>
          <input
            type="date"
            value={dateValue}
            disabled={brief.dateRequest === "Flexible"}
            onChange={(event) =>
              setBrief((current) => ({
                ...current,
                dateRequest: event.target.value || undefined,
              }))
            }
          />
          {savedCustomDate && <small>Saved request: {savedCustomDate}</small>}
        </label>

        <div className={styles.field}>
          <span className={styles.label}>Scheduling</span>
          <label className={styles.flexible}>
            <input
              type="checkbox"
              checked={brief.dateRequest === "Flexible"}
              onChange={(event) =>
                setBrief((current) => ({
                  ...current,
                  dateRequest: event.target.checked ? "Flexible" : undefined,
                }))
              }
            />
            <span>My dates are flexible</span>
          </label>
        </div>
      </div>

      <button
        type="button"
        className={styles.additionalToggle}
        aria-expanded={additionalOpen}
        onClick={() => setAdditionalOpen((current) => !current)}
      >
        <span>{additionalOpen ? "−" : "+"}</span>
        Additional
      </button>

      {additionalOpen && (
        <div className={styles.additional}>
          <label className={styles.full}>
            <span>
              Campaign name <small>Optional</small>
            </span>
            <input
              value={campaignName}
              onChange={(event) => setCampaignName(event.target.value)}
              placeholder="The assistant can name it from your goal"
            />
          </label>

          <label className={styles.full}>
            <span>
              Track name <small>Optional</small>
            </span>
            <input
              value={brief.trackName ?? ""}
              onChange={(event) =>
                setBrief((current) => ({
                  ...current,
                  trackName: event.target.value,
                }))
              }
              placeholder="Add it only when it is useful"
            />
          </label>

          <label className={styles.full}>
            <span>
              Additional context <small>Optional</small>
            </span>
            <textarea
              value={brief.additionalContext ?? ""}
              onChange={(event) =>
                setBrief((current) => ({
                  ...current,
                  additionalContext: event.target.value,
                }))
              }
              placeholder="Audience context or planning notes. Add publishing links and edit requests in Content."
            />
          </label>
        </div>
      )}

      <div className={styles.actions}>
        {status && <span role={status === "Saved" ? "status" : "alert"}>{status}</span>}
        <button type="button" onClick={() => void save()} disabled={saving}>
          {saving ? "Saving…" : "Save brief"}
        </button>
      </div>
    </div>
  );
};
