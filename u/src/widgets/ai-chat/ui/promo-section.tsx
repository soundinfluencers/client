import promoAfter from "@/assets/promo-examples/after.webp";
import promoBefore from "@/assets/promo-examples/before.webp";
import promoGenerated from "@/assets/promo-examples/generated.webp";
import type {
  CampaignDraftDto,
  PromoCreativeSource,
} from "@/entities/client-side/campaign-draft/api/campaign-draft.dto.ts";
// The cards share the studio's design module — one look for one feature.
import styles from "./promo-studio.module.scss";

interface Props {
  draft: CampaignDraftDto;
  onPick: (method: PromoCreativeSource) => void;
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

// An asset URL that no longer resolves must not leave a broken-image icon.
const hideImage = (event: { currentTarget: HTMLImageElement }) => {
  event.currentTarget.style.display = "none";
};

export const PromoSection = ({ draft, onPick }: Props) => {
  const approved = draft.promoCreative;

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
            <span className={styles.cardEyebrow}>Selected</span>
            <strong>{approved.headline || "Approved promo"}</strong>
            <span className={styles.approvedActions}>
              <a href={approved.assetUrl} download target="_blank" rel="noreferrer">
                Download
              </a>
            </span>
          </div>
        )}
      </div>

    </div>
  );
};
