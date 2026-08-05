import { useEffect, useState } from "react";

import { uploadImageApi } from "@/api/upload/upload-image.api.ts";
import promoAfter from "@/assets/promo-examples/after.webp";
import promoBefore from "@/assets/promo-examples/before.webp";
import promoGenerated from "@/assets/promo-examples/generated.webp";
import type {
  CampaignDraftDto,
  PromoCreativeDto,
  PromoCreativeSource,
} from "@/entities/client-side/campaign-draft/api/campaign-draft.dto.ts";
import { promoBlobToFile } from "@/entities/client-side/promo-creative/model/promo-creative.model.ts";
import {
  listPromoHistory,
  markPromoHistoryApproved,
  type PromoHistoryEntry,
} from "@/entities/client-side/promo-creative/model/promo-history.store.ts";

// The cards and the history strip share the studio's design module — one look for
// one feature, rendered in two places.
import styles from "./promo-studio.module.scss";

interface Props {
  draft: CampaignDraftDto;
  onPick: (method: PromoCreativeSource) => void;
  onApproved: (promo: PromoCreativeDto) => Promise<void>;
}

const METHOD_OPTIONS: readonly {
  id: PromoCreativeSource;
  eyebrow: string;
  title: string;
  description: string;
  // What this route actually produces, so the choice is made by looking.
  example?: string;
}[] = [
  {
    id: "upload",
    eyebrow: "I have a finished asset",
    title: "Upload ready promo",
    description: "Use artwork that is already approved and ready to publish.",
  },
  {
    id: "photo",
    eyebrow: "Start with my visual",
    title: "Create from a photo",
    description: "Turn an artist or release photo into campaign-ready artwork.",
  },
  {
    id: "generated",
    eyebrow: "Describe what you want",
    title: "Create from prompt",
    description: "Write the visual you have in mind and get it made.",
    example: promoGenerated,
  },
] as const;

type HistoryPreview = PromoHistoryEntry & { previewUrl: string };

// An asset URL that no longer resolves must not leave a broken-image icon.
const hideImage = (event: { currentTarget: HTMLImageElement }) => {
  event.currentTarget.style.display = "none";
};

export const PromoSection = ({ draft, onPick, onApproved }: Props) => {
  const [entries, setEntries] = useState<PromoHistoryEntry[]>([]);
  const [previews, setPreviews] = useState<HistoryPreview[]>([]);
  const [revision, setRevision] = useState(0);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const approved = draft.promoCreative;

  useEffect(() => {
    let active = true;
    void listPromoHistory(draft._id)
      .then((loaded) => active && setEntries(loaded))
      .catch(() => active && setEntries([]));
    return () => {
      active = false;
    };
  }, [draft._id, revision]);

  useEffect(() => {
    const withUrls = entries.map((entry) => ({
      ...entry,
      previewUrl: URL.createObjectURL(entry.asset),
    }));
    setPreviews(withUrls);
    return () => withUrls.forEach((entry) => URL.revokeObjectURL(entry.previewUrl));
  }, [entries]);

  const restore = async (entry: PromoHistoryEntry) => {
    setRestoringId(entry.id);
    setError(null);
    try {
      const assetUrl = await uploadImageApi(
        promoBlobToFile(entry.asset, entry.headline || entry.label),
      );
      await onApproved({
        id: entry.id,
        assetUrl,
        source: entry.source,
        ...(entry.styleId ? { styleId: entry.styleId } : {}),
        ...(entry.headline ? { headline: entry.headline } : {}),
        ...(entry.subheadline ? { subheadline: entry.subheadline } : {}),
        ...(entry.generator ? { generator: entry.generator } : {}),
        createdAt: new Date().toISOString(),
      });
      await markPromoHistoryApproved(draft._id, entry.id).catch(() => undefined);
      setRevision((current) => current + 1);
    } catch {
      setError("This version could not be restored. Check the connection and try again.");
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className={styles.methodScreen}>
      <div className={styles.methodGrid}>
        {METHOD_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            className={styles.methodCard}
            onClick={() => onPick(option.id)}
          >
            <span
              className={`${styles.methodVisual} ${styles[`methodVisual_${option.id}`]}`}
              aria-hidden="true"
            >
              {option.id === "photo" ? (
                // Before and after, side by side. The captions stand on their own
                // until the example files are dropped into public/promo-examples.
                <span className={styles.beforeAfter}>
                  <span>
                    <img src={promoBefore} alt="" />
                    <small>Before</small>
                  </span>
                  <span>
                    <img src={promoAfter} alt="" />
                    <small>Promo</small>
                  </span>
                </span>
              ) : option.example ? (
                <img className={styles.methodExample} src={option.example} alt="" />
              ) : option.id === "upload" ? (
                <span className={styles.uploadGlyph}>↑</span>
              ) : (
                <span className={styles.generatedGlyph}>
                  <i />
                  <i />
                  <i />
                </span>
              )}
            </span>
            <span className={styles.cardEyebrow}>{option.eyebrow}</span>
            <strong>{option.title}</strong>
            <small>{option.description}</small>
            <span className={styles.cardAction}>
              Continue <b>→</b>
            </span>
          </button>
        ))}

        {approved && (
          <div className={`${styles.methodCard} ${styles.approvedCard}`}>
            <span className={styles.methodVisual} aria-hidden="true">
              <img
                className={styles.methodExample}
                src={approved.assetUrl}
                alt=""
                onError={hideImage}
              />
            </span>
            <span className={styles.cardEyebrow}>On the campaign</span>
            <strong>{approved.headline || "Approved promo"}</strong>
            <small>This is what goes out with the campaign.</small>
            <span className={styles.approvedActions}>
              <a href={approved.assetUrl} download target="_blank" rel="noreferrer">
                Download
              </a>
              <button type="button" onClick={() => onPick(approved.source)}>
                Replace
              </button>
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      {previews.length > 0 && (
        <section className={styles.history} aria-label="Creative history">
          <div className={styles.historyHeading}>
            <div>
              <span className={styles.eyebrow}>Creative history</span>
              <h3>Previous versions</h3>
            </div>
            <small>Saved in this browser</small>
          </div>
          <div className={styles.historyGrid}>
            {previews.slice(0, 9).map((entry) => {
              const isApproved = approved?.id === entry.id;
              return (
                <article key={entry.id} className={styles.historyCard}>
                  <img src={entry.previewUrl} alt={`${entry.label} promo version`} />
                  <div>
                    <span
                      className={`${styles.historyStatus} ${
                        styles[`historyStatus_${isApproved ? "approved" : entry.status}`]
                      }`}
                    >
                      {isApproved ? "Approved" : entry.status === "rejected" ? "Rejected" : "Previous"}
                    </span>
                    <strong>{entry.label}</strong>
                    {!isApproved && (
                      <button
                        type="button"
                        onClick={() => void restore(entry)}
                        disabled={restoringId !== null}
                      >
                        {restoringId === entry.id ? "Restoring…" : "Restore version"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
