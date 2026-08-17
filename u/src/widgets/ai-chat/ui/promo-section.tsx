import { useEffect, useState } from "react";

import promoAfter from "@/assets/promo-examples/after.webp";
import promoBefore from "@/assets/promo-examples/before.webp";
import promoGenerated from "@/assets/promo-examples/generated.webp";
import type {
  CampaignDraftDto,
  PromoCreativeSource,
} from "@/entities/client-side/campaign-draft/api/campaign-draft.dto.ts";
import styles from "./promo-studio.module.scss";

interface Props {
  draft: CampaignDraftDto;
  onPick: (method: PromoCreativeSource) => void;
  onContinueWithoutPromo: () => void;
  onRemove: () => Promise<void>;
}

const METHOD_OPTIONS: readonly {
  id: PromoCreativeSource;
  eyebrow: string;
  title: string;
  description: string;
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

const hideImage = (event: { currentTarget: HTMLImageElement }) => {
  event.currentTarget.style.display = "none";
};

export const PromoSection = ({
  draft,
  onPick,
  onContinueWithoutPromo,
  onRemove,
}: Props) => {
  const approved = draft.promoCreative;
  const approvedId = approved?.id;
  const [showMethods, setShowMethods] = useState(!approved);
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

  useEffect(() => {
    if (approvedId) setShowMethods(false);
  }, [approvedId]);

  const removePromo = async () => {
    if (isRemoving) return;
    setIsRemoving(true);
    setRemoveError(null);
    try {
      await onRemove();
      setConfirmingRemove(false);
      setShowMethods(true);
    } catch {
      setRemoveError("The promo could not be removed. Try again.");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className={styles.methodScreen}>
      <header className={styles.methodIntro}>
        <div>
          <span className={styles.cardEyebrow}>Optional creative</span>
          <h3>Need help with a promo?</h3>
          <p>You can continue without one, upload a finished asset, or create it here.</p>
        </div>
        {!approved && (
          <button type="button" onClick={onContinueWithoutPromo}>
            Continue without promo
          </button>
        )}
      </header>

      {approved && (
        <section className={styles.selectedPromo} aria-label="Selected promo">
          <div className={styles.selectedPreview}>
            <img
              src={approved.assetUrl}
              alt="Selected campaign promo"
              onError={hideImage}
            />
          </div>
          <div className={styles.selectedInfo}>
            <span className={styles.cardEyebrow}>Added to campaign</span>
            <h3>{approved.headline || "Selected promo"}</h3>
            <p>You can keep it, download it, replace it, or continue without a promo.</p>
            <div className={styles.approvedActions}>
              <a href={approved.assetUrl} download target="_blank" rel="noreferrer">
                Download
              </a>
              <button type="button" onClick={() => setShowMethods((value) => !value)}>
                {showMethods ? "Hide options" : "Replace"}
              </button>
              {!confirmingRemove && (
                <button
                  type="button"
                  className={styles.removePromo}
                  onClick={() => setConfirmingRemove(true)}
                >
                  Remove
                </button>
              )}
            </div>
            {confirmingRemove && (
              <div className={styles.removeConfirmation} role="alert">
                <span>Remove this promo from the campaign?</span>
                <button type="button" onClick={() => void removePromo()} disabled={isRemoving}>
                  {isRemoving ? "Removing…" : "Yes, remove"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingRemove(false)}
                  disabled={isRemoving}
                >
                  Cancel
                </button>
              </div>
            )}
            {removeError && <p className={styles.inlineError}>{removeError}</p>}
          </div>
        </section>
      )}

      {showMethods && (
        <section className={styles.methodChoices}>
          <div className={styles.methodHeading}>
            <strong>{approved ? "Choose a replacement" : "Choose how to start"}</strong>
            <span>Nothing is attached until you select “Use this promo”.</span>
          </div>
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
          </div>
        </section>
      )}

      {approved && !showMethods && (
        <div className={styles.promoDone}>
          <span>Promo is ready. The rest of the campaign can continue normally.</span>
          <button type="button" onClick={onContinueWithoutPromo}>Done</button>
        </div>
      )}
    </div>
  );
};
