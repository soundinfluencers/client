// The image model draws the whole poster, copy included — the app composes the brief
// and never paints on the result.

export type PromoReference = {
  id: string;
  name: string;
  description: string;
  // Style guidance handed to the model when this reference is picked.
  styleBrief: string;
};

export const PROMO_REFERENCES: readonly PromoReference[] = [
  {
    id: "house-poster",
    name: "SoundInfluencers poster",
    description: "Bold condensed headline over a dark club shot, one accent colour.",
    styleBrief:
      "Style: bold condensed uppercase typography stacked in the lower third, white " +
      "with a single saturated accent colour on one or two key words, over a darkened " +
      "area of a moody club or stage photograph; high contrast, premium editorial feel.",
  },
] as const;

// Everything the model needs in one brief: what to show and what to print.
export const buildPromoBrief = ({
  copy,
  look,
  reference,
}: {
  copy: string;
  look?: string;
  reference?: PromoReference;
}): string =>
  [
    copy.trim(),
    look?.trim() ? `Scene: ${look.trim()}` : "",
    reference?.styleBrief ?? "",
  ]
    .filter(Boolean)
    .join("\n");
