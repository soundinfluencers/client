import { useEffect, useRef, useState, type DragEvent } from "react";
import { createPortal } from "react-dom";

import { uploadImageApi } from "@/api/upload/upload-image.api.ts";
import type {
  CampaignDraftDto,
  PromoCreativeDto,
  PromoCreativeSource,
} from "@/entities/client-side/campaign-draft/api/campaign-draft.dto.ts";
import {
  buildPromoBrief,
  PROMO_REFERENCES,
  type PromoReference,
} from "@/entities/client-side/promo-creative/model/promo-creative.model.ts";
import {
  PromoImageError,
  createPromoImageDirections,
} from "@/entities/client-side/promo-creative/api/promo-image.api.ts";
import { listPromoReferences } from "@/entities/client-side/promo-creative/api/promo-reference.api.ts";

import styles from "./promo-studio.module.scss";

type StudioStep = "configure" | "review";
type PromoFidelity = "low" | "high";

interface Props {
  open: boolean;
  draft: CampaignDraftDto;
  method: PromoCreativeSource;
  onClose: () => void;
  onApproved: (promo: PromoCreativeDto) => Promise<void>;
  onGenerated?: (count: number) => void;
}

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const MIN_COPY_LENGTH = 10;
const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const CUSTOM_REFERENCE = "custom";

const createId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const validateImage = (file: File) => {
  if (!ACCEPTED_IMAGE_TYPES.has(file.type)) return "Use a JPG, PNG, or WebP image.";
  if (file.size > MAX_FILE_SIZE) return "Choose an image smaller than 15 MB.";
  return null;
};

export const PromoStudio = ({
  open,
  draft,
  method,
  onClose,
  onApproved,
  onGenerated,
}: Props) => {
  const [step, setStep] = useState<StudioStep>("configure");
  const [copy, setCopy] = useState("");
  const [look, setLook] = useState("");
  // Admin-managed looks win; the built-in one keeps the picker useful until the
  // team adds their own.
  const [references, setReferences] = useState<readonly PromoReference[]>(PROMO_REFERENCES);
  const [referenceId, setReferenceId] = useState<string>(
    PROMO_REFERENCES[0]?.id ?? CUSTOM_REFERENCE,
  );
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [isDraggingSource, setIsDraggingSource] = useState(false);
  const [fidelity, setFidelity] = useState<PromoFidelity>("high");
  const [generated, setGenerated] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [generationModel, setGenerationModel] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const reference: PromoReference | undefined =
    referenceId === CUSTOM_REFERENCE
      ? undefined
      : references.find((item) => item.id === referenceId);
  const isUpload = method === "upload";

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => closeRef.current?.focus(), 0);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSaving && !isGenerating) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isGenerating, isSaving, onClose, open]);

  useEffect(() => {
    if (!open) return;
    setStep("configure");
    setCopy(draft.campaignName ? `${draft.campaignName} — out now` : "");
    setLook("");
    setReferenceId(references[0]?.id ?? CUSTOM_REFERENCE);
    setSourceFile(null);
    setGenerated([]);
    setActiveIndex(0);
    setGenerationModel(null);
    setError(null);
  }, [draft.campaignName, method, open]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    void listPromoReferences()
      .then((loaded) => {
        if (!active || !loaded.length) return;
        setReferences(loaded);
        setReferenceId((current) =>
          current === CUSTOM_REFERENCE || loaded.some((item) => item.id === current)
            ? current
            : loaded[0].id,
        );
      })
      .catch(() => {
        // The built-in reference keeps promo creation available during an outage.
      });
    return () => {
      active = false;
    };
  }, [open]);

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
    const urls = generated.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [generated]);

  if (!open) return null;

  const selectFile = (file?: File) => {
    if (!file) return;
    const invalid = validateImage(file);
    if (invalid) {
      setError(invalid);
      return;
    }
    setSourceFile(file);
    setError(null);
  };

  // The file input is visually hidden, so the zone handles the drop itself. Without
  // preventDefault the browser opens the dropped file and the draft is lost.
  const allowSourceDrag = (event: DragEvent<HTMLLabelElement>) => {
    if (isSaving || isGenerating) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setIsDraggingSource(true);
  };

  const endSourceDrag = (event: DragEvent<HTMLLabelElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    setIsDraggingSource(false);
  };

  const dropSourceFile = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDraggingSource(false);
    if (isSaving || isGenerating) return;
    selectFile(event.dataTransfer.files?.[0]);
  };

  const generate = async () => {
    if (method === "photo" && !sourceFile) {
      setError("Add the photo you want to work from.");
      return;
    }
    if (copy.trim().length < MIN_COPY_LENGTH) {
      setError(`Write what the promo should say — at least ${MIN_COPY_LENGTH} characters.`);
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const result = await createPromoImageDirections({
        prompt: buildPromoBrief({ copy, look, reference }),
        source: method === "photo" ? (sourceFile ?? undefined) : undefined,
        fidelity: method === "photo" ? fidelity : undefined,
      });
      if (!result.files.length) throw new Error("No images returned");
      setGenerated(result.files);
      setGenerationModel(result.model);
      setActiveIndex(0);
      setStep("review");
      onGenerated?.(result.files.length);
    } catch (cause) {
      setError(
        cause instanceof PromoImageError
          ? cause.message
          : "The promo could not be created. Try again in a moment.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const approve = async () => {
    const file = isUpload ? sourceFile : generated[activeIndex];
    if (!file) {
      setError(isUpload ? "Choose the finished promo first." : "Create a promo first.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const assetUrl = await uploadImageApi(file);
      let sourceAssetUrl: string | undefined;
      if (method === "photo" && sourceFile) sourceAssetUrl = await uploadImageApi(sourceFile);

      await onApproved({
        id: createId(),
        assetUrl,
        source: method,
        ...(sourceAssetUrl ? { sourceAssetUrl } : {}),
        ...(isUpload
          ? {}
          : {
              headline: copy.trim(),
              generator: generationModel ?? "gpt-image-2",
              ...(reference ? { styleId: reference.id } : {}),
            }),
        createdAt: new Date().toISOString(),
      });
      onClose();
    } catch {
      setError("The promo could not be saved. Check the connection and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const heading = isUpload
    ? "Upload the finished promo"
    : step === "configure"
      ? "Describe the promo"
      : "Pick the one to use";

  const studio = (
    <section
      className={styles.studio}
      role="dialog"
      aria-modal="true"
      aria-labelledby="promo-studio-title"
    >
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Campaign creative</span>
          <h2 id="promo-studio-title">{heading}</h2>
          <p>{draft.campaignName || "Untitled campaign"}</p>
        </div>
        <button
          ref={closeRef}
          type="button"
          className={styles.close}
          onClick={onClose}
          disabled={isSaving || isGenerating}
          aria-label="Close"
        >
          ×
        </button>
      </header>

      {/* Failures belong at the top, where the eye already is. */}
      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      <div className={styles.body}>
        {step === "configure" && (
          <div className={styles.configureGrid}>
            <div className={styles.formColumn}>
              {(isUpload || method === "photo") && (
                <label
                  className={`${styles.dropzone} ${sourcePreview ? styles.dropzoneFilled : ""} ${
                    isDraggingSource ? styles.dropzoneActive : ""
                  }`}
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
                    <img src={sourcePreview} alt="Selected" />
                  ) : (
                    <span>
                      <b>
                        {isDraggingSource
                          ? "Release to add the image"
                          : isUpload
                            ? "Drop your finished promo here"
                            : "Drop the photo to work from"}
                      </b>
                      <small>JPG, PNG, or WebP · up to 15 MB</small>
                    </span>
                  )}
                </label>
              )}

              {!isUpload && (
                <label className={styles.field}>
                  <span>What should the promo say</span>
                  <textarea
                    value={copy}
                    onChange={(event) => setCopy(event.target.value)}
                    rows={4}
                    maxLength={600}
                    placeholder={`Nicole da Silva — new single "Quero Mais" is out now`}
                  />
                  <small className={styles.fieldHint}>
                    Write the words exactly as they should appear. The image model prints
                    them onto the artwork.
                  </small>
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
            </div>

            {!isUpload && (
              <div className={styles.styleColumn}>
                <div className={styles.sectionHeading}>
                  <span>Look</span>
                  <small>Pick a reference, or describe your own.</small>
                </div>

                <div className={styles.referenceGrid}>
                  {references.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={referenceId === item.id ? styles.referenceSelected : ""}
                      onClick={() => setReferenceId(item.id)}
                    >
                      <img src={item.preview} alt="" />
                      <b>{item.name}</b>
                    </button>
                  ))}
                  <button
                    type="button"
                    className={`${styles.referenceCustom} ${
                      referenceId === CUSTOM_REFERENCE ? styles.referenceSelected : ""
                    }`}
                    onClick={() => setReferenceId(CUSTOM_REFERENCE)}
                  >
                    <span aria-hidden="true">✎</span>
                    <b>Custom</b>
                  </button>
                </div>

                {referenceId === CUSTOM_REFERENCE && (
                  <label className={styles.field}>
                    <span>Describe the look</span>
                    <textarea
                      value={look}
                      onChange={(event) => setLook(event.target.value)}
                      rows={4}
                      maxLength={900}
                      placeholder="Foggy harbour at night, single spotlight on the artist, deep blues, grainy film look"
                    />
                  </label>
                )}
              </div>
            )}
          </div>
        )}

        {step === "review" && (
          <div className={styles.reviewGrid}>
            <div className={styles.carousel}>
              {previews[activeIndex] && (
                <img className={styles.result} src={previews[activeIndex]} alt="Promo option" />
              )}
              {previews.length > 1 && (
                <>
                  <button
                    type="button"
                    className={`${styles.carouselArrow} ${styles.carouselArrowPrev}`}
                    onClick={() =>
                      setActiveIndex((activeIndex + previews.length - 1) % previews.length)
                    }
                    aria-label="Previous option"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    className={`${styles.carouselArrow} ${styles.carouselArrowNext}`}
                    onClick={() => setActiveIndex((activeIndex + 1) % previews.length)}
                    aria-label="Next option"
                  >
                    →
                  </button>
                </>
              )}
            </div>

            <div className={styles.reviewInfo}>
              <div className={styles.filmstrip} aria-label="Promo options">
                {previews.map((preview, index) => (
                  <button
                    key={preview}
                    type="button"
                    className={index === activeIndex ? styles.filmstripActive : ""}
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Show option ${index + 1}`}
                    aria-current={index === activeIndex ? "true" : undefined}
                  >
                    <img src={preview} alt="" />
                    <small>{index + 1}</small>
                  </button>
                ))}
              </div>

              {/* Wrong word, wrong mood — change the brief and run it again. */}
              <label className={styles.field}>
                <span>Not right? Change it and try again</span>
                <textarea
                  value={copy}
                  onChange={(event) => setCopy(event.target.value)}
                  rows={3}
                  maxLength={600}
                />
              </label>
              <button
                type="button"
                className={styles.secondary}
                onClick={() => void generate()}
                disabled={isGenerating || isSaving}
              >
                {isGenerating ? "Creating…" : "Try again"}
              </button>
            </div>
          </div>
        )}
      </div>

      <footer className={styles.footer}>
        <button
          type="button"
          className={styles.secondary}
          onClick={step === "review" ? () => setStep("configure") : onClose}
          disabled={isSaving || isGenerating}
        >
          Back
        </button>
        <div>
          {step === "configure" && !isUpload && (
            <button
              type="button"
              className={styles.primary}
              onClick={() => void generate()}
              disabled={isGenerating}
            >
              {isGenerating ? "Creating…" : "Create"}
            </button>
          )}
          {(step === "review" || isUpload) && (
            <button
              type="button"
              className={styles.primary}
              onClick={() => void approve()}
              disabled={isSaving || isGenerating}
            >
              {isSaving ? "Saving…" : "Use this promo"}
            </button>
          )}
        </div>
      </footer>
    </section>
  );

  // Rendered into the body: the workspace layer is animated with a transform, and a
  // transformed ancestor would trap this fixed overlay inside the panel.
  return createPortal(
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving && !isGenerating) onClose();
      }}
    >
      {studio}
    </div>,
    document.body,
  );
};
