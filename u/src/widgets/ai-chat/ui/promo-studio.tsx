import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
} from "react";

import { uploadImageApi } from "@/api/upload/upload-image.api.ts";
import type {
  CampaignDraftDto,
  PromoCreativeDto,
  PromoCreativeSource,
} from "@/entities/client-side/campaign-draft/api/campaign-draft.dto.ts";
import {
  PROMO_STYLE_PRESETS,
  createCustomPromoStyle,
  createPromoVariants,
  promoBlobToFile,
  promoLineUsesAccent,
  renderPromoVariant,
  type PromoStyle,
  type PromoVariant,
} from "@/entities/client-side/promo-creative/model/promo-creative.model.ts";
import {
  listPromoHistory,
  markPromoHistoryApproved,
  savePromoHistoryBatch,
  type PromoHistoryEntry,
  type PromoHistoryStatus,
} from "@/entities/client-side/promo-creative/model/promo-history.store.ts";
import {
  PromoImageError,
  createPromoImageDirections,
} from "@/entities/client-side/promo-creative/api/promo-image.api.ts";
import { listPromoHeadlineStyles } from "@/entities/client-side/promo-creative/api/promo-headline-style.api.ts";

import styles from "./promo-studio.module.scss";

type PromoMethod = PromoCreativeSource;
type StudioStep = "method" | "configure" | "review";
// Who puts the campaign copy on the artwork: the app (exact, re-editable for free)
// or the image model (integrated into the scene, spelling not guaranteed).
type PromoTextMode = "overlay" | "in-image";
type PromoFidelity = "low" | "high";

interface Props {
  open: boolean;
  draft: CampaignDraftDto;
  onClose: () => void;
  onApproved: (promo: PromoCreativeDto) => Promise<void>;
  // Fired once a batch of directions comes back, so the conversation can record it.
  onGenerated?: (count: number) => void;
  // Rendered inside the campaign workspace instead of as a modal: no overlay, no
  // scroll lock, and the surrounding panel owns closing.
  embedded?: boolean;
}

const MAX_FILE_SIZE = 15 * 1024 * 1024;
// Mirrors the server-side MinLength on the prompt field.
const MIN_PROMPT_LENGTH = 10;
const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const METHOD_OPTIONS: readonly {
  id: PromoMethod;
  eyebrow: string;
  title: string;
  description: string;
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
    eyebrow: "Use a reusable direction",
    title: "Create from a style",
    description: "Combine the campaign copy with a template and visual style.",
  },
] as const;

const createId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const validateImage = (file: File) => {
  if (!ACCEPTED_IMAGE_TYPES.has(file.type))
    return "Use a JPG, PNG, or WebP image.";
  if (file.size > MAX_FILE_SIZE) return "Choose an image smaller than 15 MB.";
  return null;
};

const restoreStyleSelection = (
  savedStyleId?: string,
  presets: readonly PromoStyle[] = PROMO_STYLE_PRESETS,
) => {
  const customMatch = savedStyleId?.match(
    /^custom-([0-9a-f]{6})-([0-9a-f]{6})$/i,
  );
  if (customMatch) {
    return {
      styleId: "custom",
      background: `#${customMatch[1]}`,
      accent: `#${customMatch[2]}`,
    };
  }
  return {
    styleId: presets.some((style) => style.id === savedStyleId)
      ? savedStyleId!
      : presets[0]?.id ?? PROMO_STYLE_PRESETS[0].id,
  };
};

const splitPreviewHeadline = (value: string) => {
  const words = value.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= 20 || !current) current = candidate;
    else {
      lines.push(current);
      current = word;
    }
  });
  if (current) lines.push(current);
  return lines.slice(0, 4);
};

type PromoHistoryPreview = PromoHistoryEntry & { previewUrl: string };

const historyStatusLabel: Record<PromoHistoryStatus, string> = {
  approved: "Approved",
  rejected: "Rejected",
  previous: "Previous",
};

export const PromoStudio = ({
  open,
  draft,
  onClose,
  onApproved,
  onGenerated,
  embedded,
}: Props) => {
  const [step, setStep] = useState<StudioStep>("method");
  const [method, setMethod] = useState<PromoMethod | null>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [isDraggingSource, setIsDraggingSource] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [headline, setHeadline] = useState(draft.campaignName || "New release");
  const [subheadline, setSubheadline] = useState("Available now");
  const [textMode, setTextMode] = useState<PromoTextMode>("overlay");
  const [fidelity, setFidelity] = useState<PromoFidelity>("high");
  const [stylePresets, setStylePresets] = useState<PromoStyle[]>([
    ...PROMO_STYLE_PRESETS,
  ]);
  const [styleId, setStyleId] = useState(PROMO_STYLE_PRESETS[0].id);
  const [customBackground, setCustomBackground] = useState("#17102b");
  const [customAccent, setCustomAccent] = useState("#ff6b4a");
  const [variants, setVariants] = useState<PromoVariant[]>([]);
  const [generatedFiles, setGeneratedFiles] = useState<File[]>([]);
  const [generatedPreviews, setGeneratedPreviews] = useState<string[]>([]);
  const [generationModel, setGenerationModel] = useState<string | null>(null);
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [historyEntries, setHistoryEntries] = useState<PromoHistoryEntry[]>([]);
  const [historyPreviews, setHistoryPreviews] = useState<PromoHistoryPreview[]>(
    [],
  );
  const [historyRevision, setHistoryRevision] = useState(0);
  const firstControlRef = useRef<HTMLButtonElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const selectedExample = useMemo(
    () =>
      (draft.addedAccounts ?? []).find(
        (account) =>
          account.isAvailable !== false &&
          account.isSelected !== false &&
          account.logoUrl,
      )?.logoUrl,
    [draft.addedAccounts],
  );
  const isCustomStyle = styleId === "custom";
  const activeStyle: PromoStyle = useMemo(
    () =>
      isCustomStyle
        ? createCustomPromoStyle(customBackground, customAccent)
        : (stylePresets.find((item) => item.id === styleId) ??
          stylePresets[0] ??
          PROMO_STYLE_PRESETS[0]),
    [customAccent, customBackground, isCustomStyle, styleId, stylePresets],
  );
  const activeVariant = variants[activeVariantIndex];
  const previewHeadlineLines = useMemo(
    () => splitPreviewHeadline(headline || "Your next release"),
    [headline],
  );

  useEffect(() => {
    if (!sourceFile) {
      setSourcePreview(null);
      return;
    }
    const url = URL.createObjectURL(sourceFile);
    setSourcePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [sourceFile]);

  useEffect(() => {
    const urls = generatedFiles.map((file) => URL.createObjectURL(file));
    setGeneratedPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [generatedFiles]);

  useEffect(() => {
    if (!open || embedded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => firstControlRef.current?.focus(), 0);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSaving && !isGenerating) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [embedded, isGenerating, isSaving, onClose, open]);

  useEffect(() => {
    if (!open) return;
    const restoredStyle = restoreStyleSelection(draft.promoCreative?.styleId);
    setStep("method");
    setMethod(null);
    setSourceFile(null);
    setPrompt("");
    setTextMode("overlay");
    setFidelity("high");
    setHeadline(
      draft.promoCreative?.headline || draft.campaignName || "New release",
    );
    setSubheadline(draft.promoCreative?.subheadline || "Available now");
    setStyleId(restoredStyle.styleId);
    if (restoredStyle.background) setCustomBackground(restoredStyle.background);
    if (restoredStyle.accent) setCustomAccent(restoredStyle.accent);
    setVariants([]);
    setGeneratedFiles([]);
    setGenerationModel(null);
    setActiveVariantIndex(0);
    setError(null);
  }, [draft.campaignName, draft.promoCreative, open]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    void listPromoHeadlineStyles()
      .then((remoteStyles) => {
        if (!active || !remoteStyles.length) return;
        setStylePresets(remoteStyles);
        setStyleId((current) => {
          const savedStyleId = draft.promoCreative?.styleId;
          if (savedStyleId && remoteStyles.some((style) => style.id === savedStyleId))
            return savedStyleId;
          if (current === "custom" || remoteStyles.some((style) => style.id === current))
            return current;
          return remoteStyles[0].id;
        });
      })
      .catch(() => {
        // The built-in library keeps promo creation available during an API outage.
      });
    return () => {
      active = false;
    };
  }, [draft.promoCreative?.styleId, open]);

  useEffect(() => {
    if (open && bodyRef.current) bodyRef.current.scrollTop = 0;
  }, [method, open, step]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    void listPromoHistory(draft._id)
      .then((entries) => {
        if (active) setHistoryEntries(entries);
      })
      .catch(() => {
        if (active) setHistoryEntries([]);
      });
    return () => {
      active = false;
    };
  }, [draft._id, historyRevision, open]);

  useEffect(() => {
    const previews = historyEntries.map((entry) => ({
      ...entry,
      previewUrl: URL.createObjectURL(entry.asset),
    }));
    setHistoryPreviews(previews);
    return () =>
      previews.forEach((entry) => URL.revokeObjectURL(entry.previewUrl));
  }, [historyEntries]);

  if (!open) return null;

  const selectMethod = (nextMethod: PromoMethod) => {
    setMethod(nextMethod);
    setSourceFile(null);
    setVariants([]);
    setGeneratedFiles([]);
    setGenerationModel(null);
    setActiveVariantIndex(0);
    setError(null);
    setStep("configure");
  };

  const selectFile = (file?: File) => {
    if (!file) return;
    const validationError = validateImage(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSourceFile(file);
    setGeneratedFiles([]);
    setGenerationModel(null);
    setError(null);
    if (method === "upload") setStep("review");
  };

  // The file input is visually hidden, so the zone has to handle the drop itself.
  // Without preventDefault the browser opens the dropped file and the draft is lost.
  const allowSourceDrag = (event: DragEvent<HTMLLabelElement>) => {
    if (isSaving || isGenerating) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setIsDraggingSource(true);
  };

  const endSourceDrag = (event: DragEvent<HTMLLabelElement>) => {
    // Moving between child nodes fires dragleave — keep the highlight until the
    // pointer actually leaves the zone.
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    setIsDraggingSource(false);
  };

  const dropSourceFile = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDraggingSource(false);
    if (isSaving || isGenerating) return;
    selectFile(event.dataTransfer.files?.[0]);
  };

  const createDirections = async () => {
    if (method === "photo" && !sourceFile) {
      setError("Add a source photo before creating directions.");
      return;
    }
    if (!headline.trim()) {
      setError("Add a headline for the promo.");
      return;
    }
    if (prompt.trim().length < MIN_PROMPT_LENGTH) {
      setError(
        `Describe the visual you want — at least ${MIN_PROMPT_LENGTH} characters.`,
      );
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      const result = await createPromoImageDirections({
        // The client's own words lead; the selected style only steers palette and framing.
        prompt: [
          prompt.trim(),
          `Visual direction: ${activeStyle.name}. ${activeStyle.description.replace(/\.\s*$/, "")}.`,
          `Palette: background ${activeStyle.background}, accent ${activeStyle.accent}.`,
          `Composition: ${activeStyle.layout}; ${activeStyle.imageTreatment} photo treatment.`,
          "Premium editorial photography, release-campaign energy, vertical composition.",
        ].join(" "),
        source: method === "photo" ? (sourceFile ?? undefined) : undefined,
        fidelity: method === "photo" ? fidelity : undefined,
        renderText: textMode === "in-image",
        headline: headline.trim(),
        subheadline: subheadline.trim(),
      });
      if (!result.files.length) throw new Error("No image directions returned");
      setGeneratedFiles(result.files);
      setGenerationModel(result.model);
      setVariants(
        createPromoVariants(activeStyle).slice(0, result.files.length),
      );
      setActiveVariantIndex(0);
      setStep("review");
      onGenerated?.(result.files.length);
    } catch (cause) {
      setError(
        cause instanceof PromoImageError
          ? cause.message
          : "The visual directions could not be created. Try again in a moment.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const approve = async () => {
    if (!method) return;
    if (method === "upload" && !sourceFile) {
      setError("Choose the finished promo first.");
      return;
    }
    if (method !== "upload" && !activeVariant) {
      setError("Create and select a direction first.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const promoId = createId();
      const createdAt = new Date().toISOString();
      const generatorId = `${generationModel ?? "gpt-image-2"}+${
        textMode === "in-image" ? "in-image-copy" : "template-compositor-v1"
      }`;
      let assetUrl: string;
      let sourceAssetUrl: string | undefined;
      let historyBatch: PromoHistoryEntry[];
      if (method === "upload") {
        assetUrl = await uploadImageApi(sourceFile!);
        historyBatch = [
          {
            id: promoId,
            draftId: draft._id,
            asset: sourceFile!,
            source: method,
            status: "approved",
            label: "Uploaded artwork",
            createdAt,
          },
        ];
      } else if (textMode === "in-image") {
        // The model already carries the copy, so the generated file ships as it is.
        const selectedFile = generatedFiles[activeVariantIndex];
        if (!selectedFile) throw new Error("Generated artwork is missing");

        if (method === "photo" && sourceFile) {
          [assetUrl, sourceAssetUrl] = await Promise.all([
            uploadImageApi(selectedFile),
            uploadImageApi(sourceFile),
          ]);
        } else assetUrl = await uploadImageApi(selectedFile);

        historyBatch = generatedFiles.map((file, index) => ({
          id: index === activeVariantIndex ? promoId : createId(),
          draftId: draft._id,
          asset: file,
          source: method,
          status: index === activeVariantIndex ? "approved" : "rejected",
          label: variants[index]?.label ?? `Direction ${index + 1}`,
          createdAt: new Date(
            Date.now() + (index === activeVariantIndex ? 10 : index),
          ).toISOString(),
          styleId: activeStyle.id,
          headline: headline.trim(),
          subheadline: subheadline.trim(),
          generator: generatorId,
          layout: variants[index]?.layout,
        }));
      } else {
        const renderedVariants = await Promise.all(
          variants.map(async (variant, index) => ({
            variant,
            asset: await renderPromoVariant({
              source: method,
              sourceFile: generatedFiles[index] ?? sourceFile ?? undefined,
              headline: headline.trim(),
              subheadline: subheadline.trim(),
              variant,
            }),
          })),
        );
        const selectedAsset = renderedVariants[activeVariantIndex].asset;
        const finalFile = promoBlobToFile(selectedAsset, headline);
        if (method === "photo" && sourceFile) {
          [assetUrl, sourceAssetUrl] = await Promise.all([
            uploadImageApi(finalFile),
            uploadImageApi(sourceFile),
          ]);
        } else assetUrl = await uploadImageApi(finalFile);

        historyBatch = renderedVariants.map(({ variant, asset }, index) => ({
          id: index === activeVariantIndex ? promoId : createId(),
          draftId: draft._id,
          asset,
          source: method,
          status: index === activeVariantIndex ? "approved" : "rejected",
          label: variant.label,
          createdAt: new Date(
            Date.now() + (index === activeVariantIndex ? 10 : index),
          ).toISOString(),
          styleId: activeStyle.id,
          headline: headline.trim(),
          subheadline: subheadline.trim(),
          generator: generatorId,
          layout: variant.layout,
        }));
      }

      await onApproved({
        id: promoId,
        assetUrl,
        source: method,
        ...(sourceAssetUrl ? { sourceAssetUrl } : {}),
        ...(method !== "upload"
          ? {
              styleId: activeStyle.id,
              headline: headline.trim(),
              subheadline: subheadline.trim(),
              generator: generatorId,
            }
          : {}),
        createdAt,
      });
      try {
        await savePromoHistoryBatch(draft._id, historyBatch);
        setHistoryRevision((revision) => revision + 1);
      } catch {
        // Browser storage should never invalidate an already saved campaign promo.
      }
      onClose();
    } catch {
      setError(
        "The promo could not be saved. Check the connection and try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const restoreHistoryEntry = async (entry: PromoHistoryEntry) => {
    setIsSaving(true);
    setError(null);
    try {
      const file = promoBlobToFile(entry.asset, entry.headline || entry.label);
      const assetUrl = await uploadImageApi(file);
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
      try {
        await markPromoHistoryApproved(draft._id, entry.id);
        setHistoryRevision((revision) => revision + 1);
      } catch {
        // The campaign asset is authoritative if browser history is unavailable.
      }
      onClose();
    } catch {
      setError(
        "This version could not be restored. Check the connection and try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const effectiveHistoryStatus = (
    entry: PromoHistoryEntry,
  ): PromoHistoryStatus => {
    if (draft.promoCreative?.id === entry.id) return "approved";
    return entry.status === "approved" ? "previous" : entry.status;
  };

  const goBack = () => {
    setError(null);
    if (step === "review" && method !== "upload") setStep("configure");
    else {
      setMethod(null);
      setSourceFile(null);
      setStep("method");
    }
  };

  const promoVariables = activeVariant
    ? ({
        "--promo-background": activeVariant.style.background,
        "--promo-accent": activeVariant.style.accent,
        "--promo-foreground": activeVariant.style.foreground,
        "--promo-filter": activeVariant.style.filter,
        "--promo-overlay": String(activeVariant.style.overlayStrength / 100),
      } as CSSProperties)
    : undefined;
  const artworkLayoutClass =
    activeVariant?.layout === "center"
      ? styles.artwork_center
      : activeVariant?.layout === "editorial"
        ? styles.artwork_editorial
        : "";
  const artworkTypographyClass =
    activeVariant?.style.typography === "condensed"
      ? styles.artwork_condensed
      : activeVariant?.style.typography === "editorial"
        ? styles.artwork_serif
        : styles.artwork_modern;

  const studio = (
      <section
        className={`${styles.studio} ${embedded ? styles.studioEmbedded : ""}`}
        // Embedded, it is a region inside the workspace, not a dialog: the panel
        // above owns Escape and the close control.
        {...(embedded ? {} : { role: "dialog", "aria-modal": true })}
        aria-labelledby="promo-studio-title"
      >
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>Campaign creative</span>
            <h2 id="promo-studio-title">
              {step === "method"
                ? "How would you like to create the promo?"
                : step === "configure"
                  ? "Shape the creative direction"
                  : "Choose the strongest version"}
            </h2>
            <p>{draft.campaignName || "Untitled campaign"}</p>
          </div>
          {!embedded && (
            <button
              ref={firstControlRef}
              type="button"
              className={styles.close}
              onClick={onClose}
              disabled={isSaving || isGenerating}
              aria-label="Close promo studio"
            >
              ×
            </button>
          )}
        </header>

        <div ref={bodyRef} className={styles.body}>
          {step === "method" && (
            <div className={styles.methodScreen}>
              <div className={styles.methodGrid}>
                {METHOD_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={styles.methodCard}
                    onClick={() => selectMethod(option.id)}
                  >
                    <span
                      className={`${styles.methodVisual} ${styles[`methodVisual_${option.id}`]}`}
                      aria-hidden="true"
                    >
                      {option.id === "photo" && (
                        <span className={styles.beforeAfter}>
                          <span>
                            {selectedExample && (
                              <img src={selectedExample} alt="" />
                            )}
                            <small>Before</small>
                          </span>
                          <span>
                            {selectedExample && (
                              <img src={selectedExample} alt="" />
                            )}
                            <i />
                            <small>Promo</small>
                          </span>
                        </span>
                      )}
                      {option.id === "upload" && (
                        <span className={styles.uploadGlyph}>↑</span>
                      )}
                      {option.id === "generated" && (
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

              {historyPreviews.length > 0 && (
                <section
                  className={styles.history}
                  aria-label="Creative history"
                >
                  <div className={styles.historyHeading}>
                    <div>
                      <span className={styles.eyebrow}>Creative history</span>
                      <h3>Previous versions</h3>
                    </div>
                    <small>Saved in this browser</small>
                  </div>
                  <div className={styles.historyGrid}>
                    {historyPreviews.slice(0, 9).map((entry) => {
                      const status = effectiveHistoryStatus(entry);
                      return (
                        <article key={entry.id} className={styles.historyCard}>
                          <img
                            src={entry.previewUrl}
                            alt={`${entry.label} promo version`}
                          />
                          <div>
                            <span
                              className={`${styles.historyStatus} ${styles[`historyStatus_${status}`]}`}
                            >
                              {historyStatusLabel[status]}
                            </span>
                            <strong>{entry.label}</strong>
                            <small>
                              {new Date(entry.createdAt).toLocaleDateString(
                                undefined,
                                { month: "short", day: "numeric" },
                              )}
                            </small>
                            {status !== "approved" && (
                              <button
                                type="button"
                                onClick={() => void restoreHistoryEntry(entry)}
                                disabled={isSaving}
                              >
                                Restore version
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
          )}

          {step === "configure" && method && (
            <div className={styles.configureGrid}>
              <div className={styles.formColumn}>
                {(method === "upload" || method === "photo") && (
                  <label
                    className={`${styles.dropzone} ${sourcePreview ? styles.dropzoneFilled : ""} ${isDraggingSource ? styles.dropzoneActive : ""}`}
                    onDragEnter={allowSourceDrag}
                    onDragOver={allowSourceDrag}
                    onDragLeave={endSourceDrag}
                    onDrop={dropSourceFile}
                  >
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) => selectFile(event.target.files?.[0])}
                    />
                    {sourcePreview ? (
                      <img src={sourcePreview} alt="Selected source" />
                    ) : (
                      <span>
                        <b>{isDraggingSource ? "Release to add the image" : "Drop an image here"}</b>
                        <small>JPG, PNG, or WebP · up to 15 MB</small>
                      </span>
                    )}
                  </label>
                )}

                {method === "photo" && (
                  <div className={styles.field}>
                    <span>How far the model may go</span>
                    <div
                      className={styles.segmented}
                      role="group"
                      aria-label="Source photo treatment"
                    >
                      <button
                        type="button"
                        className={fidelity === "high" ? styles.segmentedActive : ""}
                        onClick={() => setFidelity("high")}
                      >
                        <b>Keep my photo</b>
                        <small>Stay close to the original</small>
                      </button>
                      <button
                        type="button"
                        className={fidelity === "low" ? styles.segmentedActive : ""}
                        onClick={() => setFidelity("low")}
                      >
                        <b>Reimagine it</b>
                        <small>Let the model rework the scene</small>
                      </button>
                    </div>
                  </div>
                )}

                {method !== "upload" && (
                  <>
                    <label className={styles.field}>
                      <span>Describe the visual</span>
                      <textarea
                        value={prompt}
                        onChange={(event) => setPrompt(event.target.value)}
                        rows={4}
                        maxLength={1200}
                        placeholder="Neon-lit rooftop at dusk, artist silhouette against the skyline, deep shadows and teal highlights"
                      />
                      <small className={styles.fieldHint}>
                        Your words lead the image; the style below only steers
                        palette and framing.
                      </small>
                    </label>
                    <label className={styles.field}>
                      <span>Headline</span>
                      <input
                        value={headline}
                        onChange={(event) => setHeadline(event.target.value)}
                        maxLength={70}
                        placeholder="Artist or release name"
                      />
                    </label>
                    <label className={styles.field}>
                      <span>Supporting line</span>
                      <input
                        value={subheadline}
                        onChange={(event) => setSubheadline(event.target.value)}
                        maxLength={90}
                        placeholder="Release date, CTA, or short message"
                      />
                    </label>
                    <div className={styles.field}>
                      <span>Who sets the copy</span>
                      <div
                        className={styles.segmented}
                        role="group"
                        aria-label="Who sets the copy"
                      >
                        <button
                          type="button"
                          className={textMode === "overlay" ? styles.segmentedActive : ""}
                          onClick={() => setTextMode("overlay")}
                        >
                          <b>Exact overlay</b>
                          <small>The app types it — always spelled right</small>
                        </button>
                        <button
                          type="button"
                          className={textMode === "in-image" ? styles.segmentedActive : ""}
                          onClick={() => setTextMode("in-image")}
                        >
                          <b>Model writes it</b>
                          <small>Part of the artwork — spelling may vary</small>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {method !== "upload" && (
                <div className={styles.styleColumn}>
                  <div className={styles.sectionHeading}>
                    <span>Headline style</span>
                    <small>
                      Choose a reusable layout, type treatment, and palette.
                    </small>
                  </div>
                  <div className={styles.styleGrid}>
                    {stylePresets.map((preset) => {
                      const sampleLines = splitPreviewHeadline(preset.sampleHeadline).slice(0, 3);
                      return (
                      <button
                        key={preset.id}
                        type="button"
                        className={
                          styleId === preset.id ? styles.styleSelected : ""
                        }
                        onClick={() => setStyleId(preset.id)}
                      >
                        <i
                          className={styles.styleMiniPreview}
                          style={{
                            background: `linear-gradient(135deg, ${preset.background}, ${preset.accent})`,
                            color: preset.foreground,
                          }}
                        >
                          {sampleLines.map((line, index) => (
                            <b
                              key={`${line}-${index}`}
                              style={{
                                color: promoLineUsesAccent(
                                  preset.accentMode,
                                  index,
                                  sampleLines.length,
                                )
                                  ? preset.accent
                                  : preset.foreground,
                              }}
                            >
                              {preset.uppercase ? line.toUpperCase() : line}
                            </b>
                          ))}
                        </i>
                        <span>
                          <b>{preset.name}</b>
                          <small>{preset.description}</small>
                        </span>
                      </button>
                    )})}
                    <button
                      type="button"
                      className={isCustomStyle ? styles.styleSelected : ""}
                      onClick={() => setStyleId("custom")}
                    >
                      <i
                        className={styles.customSwatch}
                        style={{
                          background: `linear-gradient(135deg, ${customBackground}, ${customAccent})`,
                        }}
                      />
                      <span>
                        <b>Custom style</b>
                        <small>Use your own campaign colors</small>
                      </span>
                    </button>
                  </div>
                  {isCustomStyle && (
                    <div className={styles.colorControls}>
                      <label>
                        <span>Base</span>
                        <input
                          type="color"
                          value={customBackground}
                          onChange={(event) =>
                            setCustomBackground(event.target.value)
                          }
                        />
                      </label>
                      <label>
                        <span>Accent</span>
                        <input
                          type="color"
                          value={customAccent}
                          onChange={(event) =>
                            setCustomAccent(event.target.value)
                          }
                        />
                      </label>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {step === "review" && method === "upload" && sourcePreview && (
            <div className={styles.uploadReview}>
              <div className={styles.uploadReviewImage}>
                <img src={sourcePreview} alt="Promo ready for approval" />
              </div>
              <div>
                <span className={styles.eyebrow}>Ready to use</span>
                <h3>Your promo is prepared</h3>
                <p>
                  Approve it to attach this asset to the campaign. You can
                  replace it at any time.
                </p>
              </div>
            </div>
          )}

          {step === "review" && method !== "upload" && activeVariant && (
            <div className={styles.reviewGrid}>
              <div className={styles.carousel}>
                <div
                  className={`${styles.artwork} ${artworkLayoutClass} ${artworkTypographyClass}`}
                  style={promoVariables}
                >
                  {(generatedPreviews[activeVariantIndex] || sourcePreview) && (
                    <img
                      src={
                        generatedPreviews[activeVariantIndex] ||
                        sourcePreview ||
                        ""
                      }
                      alt=""
                    />
                  )}
                  {/* In-image copy comes baked into the file — no overlay chrome on top. */}
                  {textMode === "overlay" && (
                    <>
                  <span className={styles.artworkTint} />
                  <span className={styles.artworkAccent} />
                  {activeVariant.style.ctaPosition === "top-right" &&
                    activeVariant.style.ctaLabel && (
                      <span className={`${styles.artworkCta} ${styles.artworkCtaTop}`}>
                        {activeVariant.style.ctaLabel} <b>»</b>
                      </span>
                    )}
                  <div className={styles.artworkCopy}>
                    <strong>
                      {previewHeadlineLines.map((line, index) => (
                        <span
                          key={`${line}-${index}`}
                          className={
                            promoLineUsesAccent(
                              activeVariant.style.accentMode,
                              index,
                              previewHeadlineLines.length,
                            )
                              ? styles.artworkCopyAccent
                              : undefined
                          }
                        >
                          {activeVariant.style.uppercase
                            ? line.toUpperCase()
                            : line}
                        </span>
                      ))}
                    </strong>
                    <small>{subheadline || "New campaign creative"}</small>
                  </div>
                  {activeVariant.style.ctaPosition === "bottom-center" &&
                    activeVariant.style.ctaLabel && (
                      <span className={`${styles.artworkCta} ${styles.artworkCtaBottom}`}>
                        {activeVariant.style.ctaLabel} <b>»</b>
                      </span>
                    )}
                  <b className={styles.artworkBrand}>Sound Influencers</b>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  className={`${styles.carouselArrow} ${styles.carouselArrowPrev}`}
                  onClick={() =>
                    setActiveVariantIndex(
                      (activeVariantIndex + variants.length - 1) %
                        variants.length,
                    )
                  }
                  aria-label="Previous direction"
                >
                  ←
                </button>
                <button
                  type="button"
                  className={`${styles.carouselArrow} ${styles.carouselArrowNext}`}
                  onClick={() =>
                    setActiveVariantIndex(
                      (activeVariantIndex + 1) % variants.length,
                    )
                  }
                  aria-label="Next direction"
                >
                  →
                </button>
              </div>
              <div className={styles.reviewInfo}>
                <span className={styles.eyebrow}>{activeVariant.label}</span>
                <h3>{activeVariant.style.name}</h3>
                <p>{activeVariant.style.description}</p>
                <div className={styles.dots} aria-label="Creative directions">
                  {variants.map((variant, index) => (
                    <button
                      key={variant.id}
                      type="button"
                      className={
                        index === activeVariantIndex ? styles.dotActive : ""
                      }
                      onClick={() => setActiveVariantIndex(index)}
                      aria-label={`Show ${variant.label}`}
                    />
                  ))}
                </div>
                <div className={styles.reviewNote}>
                  <b>Editable later</b>
                  <span>
                    The template, copy, and palette remain replaceable without
                    changing the campaign flow.
                  </span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className={styles.error} role="alert">
              {error}
            </div>
          )}
        </div>

        <footer className={styles.footer}>
          <button
            type="button"
            className={styles.secondary}
            onClick={step === "method" ? onClose : goBack}
            disabled={isSaving || isGenerating}
          >
            {step === "method" ? "Cancel" : "Back"}
          </button>
          <div>
            {step === "configure" && method !== "upload" && (
              <button
                type="button"
                className={styles.primary}
                onClick={() => void createDirections()}
                disabled={isGenerating}
              >
                {isGenerating
                  ? "Creating directions…"
                  : "Create 3 visual directions"}
              </button>
            )}
            {step === "review" && (
              <button
                type="button"
                className={styles.primary}
                onClick={() => void approve()}
                disabled={isSaving}
              >
                {isSaving ? "Saving promo…" : "Approve promo"}
              </button>
            )}
          </div>
        </footer>
      </section>
  );

  if (embedded) return studio;

  return (
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving && !isGenerating)
          onClose();
      }}
    >
      {studio}
    </div>
  );
};
