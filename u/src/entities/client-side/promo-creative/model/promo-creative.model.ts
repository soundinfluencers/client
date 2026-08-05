// The image model draws the whole poster, copy included — the app composes the brief
// and never paints on the result.

import housePoster from "@/assets/promo-examples/after.webp";

export type PromoReference = {
  id: string;
  name: string;
  // The look itself — picked by eye, not by reading.
  preview: string;
  // Style guidance handed to the model when this reference is picked.
  styleBrief: string;
};

export const PROMO_REFERENCES: readonly PromoReference[] = [
  {
    id: "house-poster",
    name: "SoundInfluencers poster",
    preview: housePoster,
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
