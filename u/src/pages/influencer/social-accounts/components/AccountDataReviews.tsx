import { useEffect, useState } from "react";
import $api from "@/api/api";
import type {
  InfluencerProfileApi,
  TSocialAccounts,
} from "@/types/user/influencer.types";
import "./account-data-reviews.css";

type Values = Record<string, unknown>;
type RequestItem = {
  _id: string;
  platform: string;
  handle: string;
  source: string;
  status: string;
  reason?: string;
  createdAt: string;
  reportDate?: string;
};
const labels: Record<string, string> = {
  username: "Username",
  profileLink: "Profile link",
  logoUrl: "Logo URL",
  followers: "Followers",
  engagementRate: "Engagement rate (%)",
  averageViews: "Average views",
  countries: "Audience countries",
  profileCategory: "Profile type",
  communityMusicGenres: "Community genres",
  communityThemeTopics: "Community topics",
  creatorMusicGenres: "Creator genres",
  creatorContentFocus: "Content focus",
  price: "Your price",
  currency: "Currency",
  publicPrice: "Public price (EUR)",
  isHidden: "Catalogue visibility (hidden)",
  displayName: "Display name",
  bio: "Bio",
  location: "Location",
  audienceTables: "Detailed audience",
  metrics: "Content statistics",
  popularPosts: "Post statistics",
  popularTags: "Hashtags and mentions",
  charts: "Growth charts",
  correctionNote: "Other correction or supporting information",
};
const platforms: TSocialAccounts[] = [
  "instagram",
  "tiktok",
  "youtube",
  "facebook",
  "spotify",
  "soundcloud",
  "press",
];
function errorMessage(e: unknown) {
  const error = e as {
    response?: { data?: { message?: unknown } };
    message?: string;
  };
  return String(
    error.response?.data?.message ??
      error.message ??
      "Unable to save the request",
  );
}
function Editor({
  value,
  name,
  onChange,
  depth = 0,
}: {
  value: unknown;
  name: string;
  onChange: (v: unknown) => void;
  depth?: number;
}) {
  if (depth > 8)
    return (
      <span>Describe the correction in the supporting information field.</span>
    );
  if (Array.isArray(value))
    return (
      <div>
        {value.map((v, i) => (
          <fieldset key={i}>
            <legend>{i + 1}</legend>
            <Editor
              name={name}
              value={v}
              depth={depth + 1}
              onChange={(next) =>
                onChange(value.map((x, j) => (i === j ? next : x)))
              }
            />
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => i !== j))}
            >
              Remove
            </button>
          </fieldset>
        ))}
        {name === "countries" && value.length < 5 && (
          <button
            type="button"
            onClick={() => onChange([...value, { country: "", percentage: 0 }])}
          >
            Add country
          </button>
        )}
        {!value.length && name !== "countries" && (
          <p>
            No verified values yet. Describe the data you want to add in
            supporting information.
          </p>
        )}
      </div>
    );
  if (value && typeof value === "object")
    return (
      <div>
        {Object.entries(value)
          .filter(
            ([k]) =>
              ![
                "source",
                "bio_source",
                "raw",
                "precision",
                "raw_display",
              ].includes(k),
          )
          .map(([k, v]) => (
            <label key={k}>
              {k.replace(/_/g, " ")}
              <Editor
                name={k}
                value={v}
                depth={depth + 1}
                onChange={(next) => onChange({ ...value, [k]: next })}
              />
            </label>
          ))}
      </div>
    );
  if (typeof value === "boolean")
    return (
      <input
        aria-label={name}
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
    );
  if (
    typeof value === "number" ||
    (value === null &&
      [
        "followers",
        "engagementRate",
        "averageViews",
        "price",
        "publicPrice",
        "percentage",
        "count",
        "share_percent",
        "value_estimate",
        "uncertainty_plus_minus",
        "relative_height",
      ].includes(name))
  )
    return (
      <input
        aria-label={name}
        type="number"
        min="0"
        step="any"
        value={typeof value === "number" ? value : ""}
        onChange={(e) =>
          onChange(e.target.value === "" ? null : Number(e.target.value))
        }
      />
    );
  if (name === "currency" || name === "profileCategory")
    return (
      <select
        aria-label={name}
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
      >
        {(name === "currency"
          ? ["EUR", "USD", "GBP"]
          : ["community", "creator"]
        ).map((v) => (
          <option key={v}>{v}</option>
        ))}
      </select>
    );
  return (
    <textarea
      aria-label={name}
      value={String(value ?? "")}
      rows={name === "bio" || name === "correctionNote" ? 4 : 1}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function AccountDataReviews({
  profile,
}: {
  profile?: InfluencerProfileApi;
}) {
  const [items, setItems] = useState<RequestItem[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [accountKey, setAccountKey] = useState("");
  const [current, setCurrent] = useState<Values>({});
  const [fieldSources, setFieldSources] = useState<
    Record<string, { source: string; observedAt?: string }>
  >({});
  const [snapshot, setSnapshot] = useState<{
    source: string;
    reportDate?: string;
  } | null>(null);
  const [field, setField] = useState("followers");
  const [changes, setChanges] = useState<Values>({});
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [requestDetail, setRequestDetail] = useState<{
    item: {
      draft: Values;
      reason: string;
      submissionReason?: string;
      status: string;
    };
    current: Values;
  } | null>(null);
  const accounts = platforms.flatMap((platform) =>
    (profile?.[platform] ?? []).map((account) => ({
      platform,
      accountId: account.accountId,
      label: `${platform} · @${account.username}`,
    })),
  );
  const load = async () => {
    const response = await $api.get("/profile/account-data", {
      params: { page },
    });
    setItems(response.data.data.items);
    setPages(response.data.data.pages || 1);
  };
  useEffect(() => {
    let active = true;
    $api
      .get("/profile/account-data", { params: { page } })
      .then((response) => {
        if (active) {
          setItems(response.data.data.items);
          setPages(response.data.data.pages || 1);
        }
      })
      .catch((e) => {
        if (active) setError(errorMessage(e));
      });
    return () => {
      active = false;
    };
  }, [page]);
  useEffect(() => {
    setChanges({});
    setCurrent({});
    setSnapshot(null);
    setError("");
    if (!accountKey) return;
    let active = true;
    setLoading(true);
    const [platform, accountId] = accountKey.split(":");
    $api
      .get(`/profile/account-data/accounts/${platform}/${accountId}`)
      .then((response) => {
        if (active) {
          setCurrent(response.data.data.current);
          setFieldSources(response.data.data.fieldSources ?? {});
          setSnapshot(response.data.data.snapshot);
        }
      })
      .catch((e) => {
        if (active) setError(errorMessage(e));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [accountKey]);
  const addField = () => {
    const value =
      current[field] ??
      ([
        "followers",
        "engagementRate",
        "averageViews",
        "price",
        "publicPrice",
      ].includes(field)
        ? 0
        : field === "isHidden"
          ? false
          : [
                "countries",
                "audienceTables",
                "metrics",
                "popularPosts",
                "charts",
                "communityMusicGenres",
                "communityThemeTopics",
                "creatorMusicGenres",
                "creatorContentFocus",
              ].includes(field)
            ? []
            : field === "popularTags"
              ? { hashtags: [], mentions: [] }
              : "");
    setChanges({
      ...changes,
      [field]: structuredClone(value),
      ...(["price", "currency"].includes(field)
        ? { price: current.price ?? 0, currency: current.currency ?? "EUR" }
        : {}),
    });
  };
  return (
    <section className="account-data-reviews">
      <h2>Statistics & correction requests</h2>
      <p>
        You can suggest corrections to any of your account data, including
        verified statistics. The team reviews each request before it changes
        your published profile.
      </p>
      {error && (
        <p role="alert" className="review-error">
          {error}
        </p>
      )}
      {notice && <p role="status">{notice}</p>}
      <fieldset disabled={busy}>
        <legend>Suggest a correction</legend>
        <label>
          Social account
          <select
            value={accountKey}
            onChange={(e) => setAccountKey(e.target.value)}
          >
            <option value="">Choose your account</option>
            {accounts
              .filter((a) => a.accountId)
              .map((a) => (
                <option
                  key={`${a.platform}:${a.accountId}`}
                  value={`${a.platform}:${a.accountId}`}
                >
                  {a.label}
                </option>
              ))}
          </select>
        </label>
        {loading && <p>Loading approved data…</p>}
        {accountKey && !loading && (
          <>
            <p>
              Last approved report: {snapshot?.reportDate ?? "No dated report"}
              {snapshot ? ` · ${snapshot.source}` : ""}
            </p>
            <details>
              <summary>View current approved data</summary>
              {Object.entries(current)
                .filter(([, v]) => v != null)
                .map(([k, v]) => (
                  <div key={k}>
                    <strong>{labels[k] ?? k}</strong>
                    {fieldSources[k] && (
                      <small>
                        Source: {fieldSources[k].source}
                        {fieldSources[k].observedAt
                          ? ` · Observed ${fieldSources[k].observedAt}`
                          : ""}
                      </small>
                    )}
                    <pre>
                      {typeof v === "object"
                        ? JSON.stringify(v, null, 2)
                        : String(v)}
                    </pre>
                  </div>
                ))}
            </details>
            <div className="review-actions">
              <select
                aria-label="Field to correct"
                value={field}
                onChange={(e) => setField(e.target.value)}
              >
                {Object.entries(labels).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={field in changes}
                onClick={addField}
              >
                Add correction
              </button>
            </div>
            {Object.entries(changes).map(([key, value]) => (
              <fieldset key={key}>
                <legend>{labels[key]}</legend>
                <Editor
                  name={key}
                  value={value}
                  onChange={(next) => setChanges({ ...changes, [key]: next })}
                />
                <button
                  type="button"
                  onClick={() =>
                    setChanges(
                      Object.fromEntries(
                        Object.entries(changes).filter(([k]) => k !== key),
                      ),
                    )
                  }
                >
                  Remove correction
                </button>
              </fieldset>
            ))}
            <label>
              Explain the correction and include supporting information
              <textarea
                value={reason}
                maxLength={2000}
                rows={3}
                onChange={(e) => setReason(e.target.value)}
              />
            </label>
            <button
              type="button"
              disabled={!Object.keys(changes).length || !reason.trim()}
              onClick={async () => {
                setBusy(true);
                setError("");
                setNotice("");
                try {
                  const [platform, accountId] = accountKey.split(":");
                  await $api.post("/profile/account-data", {
                    platform,
                    accountId,
                    changes,
                    reason,
                  });
                  setChanges({});
                  setReason("");
                  setNotice(
                    "Your corrections were sent for admin approval. Published values will update after approval.",
                  );
                  await load();
                } catch (e) {
                  setError(errorMessage(e));
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? "Submitting…" : "Send for admin approval"}
            </button>
          </>
        )}
      </fieldset>
      <h3>Reports and requests</h3>
      {!items.length && <p>No reports or correction requests yet.</p>}
      <ul>
        {items.map((item) => (
          <li key={item._id}>
            <span>
              @{item.handle} ·{" "}
              {item.source === "self_reported"
                ? "Your correction"
                : item.source === "modash_pdf"
                  ? "Modash report"
                  : "Reviewed account data"}{" "}
              · {item.status}
            </span>
            <button
              disabled={busy}
              type="button"
              onClick={async () => {
                try {
                  setRequestDetail(
                    (await $api.get("/profile/account-data/" + item._id)).data
                      .data,
                  );
                } catch (e) {
                  setError(errorMessage(e));
                }
              }}
            >
              View
            </button>
          </li>
        ))}
      </ul>
      <div className="review-actions">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>
        <span>
          {page} / {pages}
        </span>
        <button
          type="button"
          disabled={page >= pages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
        <button
          type="button"
          onClick={() => void load().catch((e) => setError(errorMessage(e)))}
        >
          Refresh
        </button>
      </div>
      {requestDetail && (
        <details open>
          <summary>Request details · {requestDetail.item.status}</summary>
          {requestDetail.item.submissionReason && (
            <p>
              Your original explanation: {requestDetail.item.submissionReason}
            </p>
          )}
          {(requestDetail.item.status !== "pending" ||
            !requestDetail.item.submissionReason) && (
            <p>
              {requestDetail.item.status === "pending"
                ? "Explanation"
                : "Admin decision"}
              : {requestDetail.item.reason}
            </p>
          )}
          {Object.entries(requestDetail.item.draft).map(([key, value]) => (
            <div key={key}>
              <strong>{labels[key] ?? key}</strong>
              <pre>{JSON.stringify(value, null, 2)}</pre>
            </div>
          ))}
          <button type="button" onClick={() => setRequestDetail(null)}>
            Close
          </button>
        </details>
      )}
    </section>
  );
}
