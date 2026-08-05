import type { PromoCreativeSource } from "@/entities/client-side/campaign-draft/api/campaign-draft.dto.ts";

export type PromoLayout = "left" | "center" | "editorial";
export type PromoTypography = "condensed" | "modern" | "editorial";
export type PromoAccentMode =
  | "alternate-lines"
  | "first-line"
  | "last-line"
  | "none";
export type PromoImageTreatment = "vivid" | "warm" | "mono" | "clean";
export type PromoCtaPosition = "top-right" | "bottom-center" | "none";

export type PromoStyle = {
  id: string;
  name: string;
  description: string;
  background: string;
  accent: string;
  foreground: string;
  filter: string;
  layout: PromoLayout;
  typography: PromoTypography;
  accentMode: PromoAccentMode;
  imageTreatment: PromoImageTreatment;
  ctaPosition: PromoCtaPosition;
  ctaLabel: string;
  overlayStrength: number;
  uppercase: boolean;
  sampleHeadline: string;
};

export type PromoVariant = {
  id: string;
  label: string;
  layout: PromoLayout;
  style: PromoStyle;
};

export type PromoRenderInput = {
  source: Exclude<PromoCreativeSource, "upload">;
  sourceFile?: File;
  headline: string;
  subheadline: string;
  variant: PromoVariant;
};

export const PROMO_STYLE_PRESETS: readonly PromoStyle[] = [
  {
    id: "impact-aqua",
    name: "Impact Aqua",
    description: "Breakthroughs, standout releases and artist momentum.",
    background: "#050808",
    accent: "#4cebd1",
    foreground: "#ffffff",
    filter: "saturate(1.12) contrast(1.1) brightness(.72)",
    layout: "left",
    typography: "condensed",
    accentMode: "alternate-lines",
    imageTreatment: "vivid",
    ctaPosition: "bottom-center",
    ctaLabel: "SWIPE",
    overlayStrength: 82,
    uppercase: true,
    sampleHeadline: "NICOLE DA SILVA KEEPS RAISING THE BAR",
  },
  {
    id: "impact-orange",
    name: "Impact Orange",
    description: "High-energy launches, urgent news and release moments.",
    background: "#080706",
    accent: "#ff7a22",
    foreground: "#ffffff",
    filter: "sepia(.12) saturate(1.28) contrast(1.06) brightness(.73)",
    layout: "left",
    typography: "condensed",
    accentMode: "alternate-lines",
    imageTreatment: "warm",
    ctaPosition: "bottom-center",
    ctaLabel: "SWIPE",
    overlayStrength: 84,
    uppercase: true,
    sampleHeadline: "THE RISE ISN'T SLOWING DOWN",
  },
  {
    id: "mono-yellow",
    name: "Mono Yellow",
    description: "Awards, milestones and major industry announcements.",
    background: "#030303",
    accent: "#fff000",
    foreground: "#ffffff",
    filter: "grayscale(1) contrast(1.15) brightness(.72)",
    layout: "left",
    typography: "condensed",
    accentMode: "last-line",
    imageTreatment: "mono",
    ctaPosition: "top-right",
    ctaLabel: "SWIPE",
    overlayStrength: 78,
    uppercase: true,
    sampleHeadline: "ONE OF THE YEAR'S BIGGEST ELECTRONIC ALBUMS",
  },
  {
    id: "electric-blue",
    name: "Electric Blue",
    description: "Tour announcements, nightlife and club-culture stories.",
    background: "#070d1d",
    accent: "#6f9dff",
    foreground: "#ffffff",
    filter: "saturate(.86) contrast(1.04) brightness(.74)",
    layout: "center",
    typography: "modern",
    accentMode: "last-line",
    imageTreatment: "clean",
    ctaPosition: "top-right",
    ctaLabel: "DISCOVER",
    overlayStrength: 70,
    uppercase: true,
    sampleHeadline: "THE NIGHT JUST FOUND ITS NEW ANTHEM",
  },
  {
    id: "clean-editorial",
    name: "Clean Editorial",
    description: "Premium profiles, quotes and restrained artist storytelling.",
    background: "#151515",
    accent: "#d7c8ff",
    foreground: "#fffdf8",
    filter: "saturate(.82) contrast(1.02) brightness(.78)",
    layout: "editorial",
    typography: "editorial",
    accentMode: "first-line",
    imageTreatment: "clean",
    ctaPosition: "none",
    ctaLabel: "",
    overlayStrength: 62,
    uppercase: false,
    sampleHeadline: "A QUIETER KIND OF BREAKTHROUGH",
  },
] as const;

const VARIANT_LAYOUTS: readonly PromoLayout[] = ["left", "center", "editorial"];

export const createPromoVariants = (style: PromoStyle): PromoVariant[] => {
  const layouts = [
    style.layout,
    ...VARIANT_LAYOUTS.filter((layout) => layout !== style.layout),
  ];
  return layouts.map((layout, index) => ({
    id: `${style.id}-${layout}`,
    label: `Direction ${String(index + 1).padStart(2, "0")}`,
    layout,
    style,
  }));
};

export const createCustomPromoStyle = (
  background: string,
  accent: string,
): PromoStyle => ({
  id: `custom-${background.slice(1)}-${accent.slice(1)}`,
  name: "Custom direction",
  description: "Your campaign palette",
  background,
  accent,
  foreground: "#ffffff",
  filter: "saturate(1.08) contrast(1.06) brightness(.72)",
  layout: "left",
  typography: "modern",
  accentMode: "alternate-lines",
  imageTreatment: "vivid",
  ctaPosition: "top-right",
  ctaLabel: "SWIPE",
  overlayStrength: 76,
  uppercase: true,
  sampleHeadline: "YOUR CAMPAIGN HEADLINE",
});

export const PROMO_IMAGE_FILTERS: Record<PromoImageTreatment, string> = {
  vivid: "saturate(1.12) contrast(1.1) brightness(.72)",
  warm: "sepia(.12) saturate(1.28) contrast(1.06) brightness(.73)",
  mono: "grayscale(1) contrast(1.15) brightness(.72)",
  clean: "saturate(.86) contrast(1.04) brightness(.76)",
};

export const promoLineUsesAccent = (
  mode: PromoAccentMode,
  index: number,
  total: number,
) => {
  if (mode === "alternate-lines") return index % 2 === 1;
  if (mode === "first-line") return index === 0;
  if (mode === "last-line") return index === total - 1;
  return false;
};

const hexToRgba = (hex: string, alpha: number) => {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((part) => part + part)
          .join("")
      : normalized;
  const number = Number.parseInt(value, 16);
  return `rgba(${(number >> 16) & 255}, ${(number >> 8) & 255}, ${number & 255}, ${alpha})`;
};

const loadBitmap = async (file: File) => {
  if ("createImageBitmap" in window) return createImageBitmap(file);
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
};

const drawCoverImage = (
  context: CanvasRenderingContext2D,
  image: CanvasImageSource & { width: number; height: number },
  width: number,
  height: number,
) => {
  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  context.drawImage(
    image,
    (width - drawWidth) / 2,
    (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
};

const wrapLines = (
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines = 4,
) => {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (context.measureText(candidate).width <= maxWidth || !current)
      current = candidate;
    else {
      lines.push(current);
      current = word;
    }
  });
  if (current) lines.push(current);
  return lines.slice(0, maxLines);
};

const roundedRectPath = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.quadraticCurveTo(
    x + width,
    y + height,
    x + width - safeRadius,
    y + height,
  );
  context.lineTo(x + safeRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  context.lineTo(x, y + safeRadius);
  context.quadraticCurveTo(x, y, x + safeRadius, y);
  context.closePath();
};

const canvasToBlob = (canvas: HTMLCanvasElement) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Promo export failed")),
      "image/png",
    );
  });

export const renderPromoVariant = async ({
  sourceFile,
  headline,
  subheadline,
  variant,
}: PromoRenderInput) => {
  const width = 1080;
  const height = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable");

  const { style, layout } = variant;
  const base = context.createLinearGradient(0, 0, width, height);
  base.addColorStop(0, style.background);
  base.addColorStop(1, hexToRgba(style.accent, 0.78));
  context.fillStyle = base;
  context.fillRect(0, 0, width, height);

  if (sourceFile) {
    const image = await loadBitmap(sourceFile);
    context.save();
    context.filter = style.filter;
    drawCoverImage(context, image, width, height);
    context.restore();
    if ("close" in image && typeof image.close === "function") image.close();
  } else {
    context.fillStyle = hexToRgba(style.accent, 0.18);
    context.beginPath();
    context.arc(width * 0.78, height * 0.2, width * 0.46, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = hexToRgba(style.foreground, 0.24);
    context.lineWidth = 2;
    for (let index = 0; index < 7; index += 1) {
      context.beginPath();
      context.arc(width * 0.18, height * 0.76, 90 + index * 54, 0, Math.PI * 2);
      context.stroke();
    }
  }

  const overlayStrength = Math.min(1, Math.max(0, style.overlayStrength / 100));
  const overlay = context.createLinearGradient(0, 0, 0, height);
  overlay.addColorStop(
    0,
    hexToRgba(
      style.background,
      layout === "center" ? 0.22 + overlayStrength * 0.18 : 0.08,
    ),
  );
  overlay.addColorStop(0.46, hexToRgba(style.background, 0.06));
  overlay.addColorStop(0.72, hexToRgba(style.background, overlayStrength * 0.62));
  overlay.addColorStop(1, hexToRgba(style.background, 0.68 + overlayStrength * 0.32));
  context.fillStyle = overlay;
  context.fillRect(0, 0, width, height);

  context.fillStyle = style.accent;
  if (layout === "editorial") context.fillRect(64, 64, 16, height - 128);
  else context.fillRect(64, 80, layout === "center" ? width - 128 : 190, 8);

  const center = layout === "center";
  const textX = center ? width / 2 : layout === "editorial" ? 118 : 64;
  const maxTextWidth = center ? width - 180 : width - textX - 70;
  const headlineY = center ? height * 0.52 : height * 0.55;
  context.textAlign = center ? "center" : "left";
  context.textBaseline = "top";
  const copyLength = (headline || "YOUR NEXT RELEASE").trim().length;
  const headlineSize =
    style.typography === "editorial"
      ? copyLength > 48
        ? 76
        : 88
      : copyLength > 58
        ? 74
        : copyLength > 38
          ? 86
          : 100;
  const lineHeight = Math.round(
    headlineSize * (style.typography === "editorial" ? 1.01 : 0.94),
  );
  const fontFamily =
    style.typography === "condensed"
      ? 'Impact, Haettenschweiler, "Arial Narrow", Arial, sans-serif'
      : style.typography === "editorial"
        ? 'Georgia, "Times New Roman", serif'
        : "Satoshi, Arial, sans-serif";
  context.font = `900 ${headlineSize}px ${fontFamily}`;
  const headlineLines = wrapLines(
    context,
    headline || "YOUR NEXT RELEASE",
    maxTextWidth,
    4,
  );
  headlineLines.forEach((line, index) => {
    context.fillStyle = promoLineUsesAccent(
      style.accentMode,
      index,
      headlineLines.length,
    )
      ? style.accent
      : style.foreground;
    context.fillText(
      style.uppercase ? line.toUpperCase() : line,
      textX,
      headlineY + index * lineHeight,
      maxTextWidth,
    );
  });

  const subtitleY = headlineY + headlineLines.length * lineHeight + 24;
  if (subheadline.trim()) {
    context.fillStyle = style.foreground;
    context.globalAlpha = 0.82;
    context.font = "650 29px Satoshi, Arial, sans-serif";
    wrapLines(context, subheadline, maxTextWidth, 2).forEach((line, index) =>
      context.fillText(line, textX, subtitleY + index * 40, maxTextWidth),
    );
    context.globalAlpha = 1;
  }

  context.fillStyle = hexToRgba(style.foreground, 0.72);
  context.font = "600 23px Satoshi, Arial, sans-serif";
  context.textAlign = "left";
  context.fillText("SOUND INFLUENCERS", 64, 54);

  if (style.ctaPosition !== "none" && style.ctaLabel.trim()) {
    const ctaText = `${style.ctaLabel.trim().toUpperCase()}  »`;
    context.font = "800 24px Satoshi, Arial, sans-serif";
    const ctaWidth = Math.ceil(context.measureText(ctaText).width) + 44;
    const ctaHeight = 54;
    const ctaX =
      style.ctaPosition === "top-right" ? width - ctaWidth - 58 : (width - ctaWidth) / 2;
    const ctaY = style.ctaPosition === "top-right" ? 42 : height - ctaHeight - 42;
    roundedRectPath(context, ctaX, ctaY, ctaWidth, ctaHeight, ctaHeight / 2);
    context.lineWidth = 3;
    context.strokeStyle = style.accent;
    context.stroke();
    context.fillStyle = style.foreground;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(ctaText, ctaX + ctaWidth / 2, ctaY + ctaHeight / 2 + 1);
  }

  return canvasToBlob(canvas);
};

export const promoBlobToFile = (blob: Blob, headline: string) => {
  const slug =
    headline
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "promo";
  return new File([blob], `${slug}-${Date.now()}.png`, { type: "image/png" });
};
