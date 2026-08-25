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
import {
  ACCEPTED_IMAGE_ACCEPT,
  inspectPromoImage,
  MAX_PROMO_IMAGE_MB,
  type PromoImageDetails,
} from "@/entities/client-side/promo-creative/model/promo-image-validation.ts";
import { fitPromoImage } from "@/entities/client-side/promo-creative/model/promo-image-fit.ts";

import styles from "./promo-studio.module.scss";

type StudioStep = "configure" | "review";
type PromoFidelity = "low" | "high";
type PromoOptionStatus = "candidate" | "rejected" | "approved";
type PromoVersion = {
  id: string;
  createdAt: string;
  files: File[];
  model: string;
  copy: string;
  look: string;
  referenceId: string;
  fidelity: PromoFidelity;
  sourceFile?: File;
  sourceDetails?: PromoImageDetails;
  statuses: PromoOptionStatus[];
};

interface Props {
  open: boolean;
  draft: CampaignDraftDto;
  method: PromoCreativeSource;
  onClose: () => void;
  onApproved: (promo: PromoCreativeDto) => Promise<void>;
  onGenerated?: (count: number, version: number) => void;
}

const MIN_COPY_LENGTH = 10;
const CUSTOM_REFERENCE = "custom";

// Deliberately front-end only: generated binaries survive closing and reopening the
// studio in this browser tab, without expanding the campaign schema or database yet.
const promoHistoryByDraft = new Map<string, PromoVersion[]>();

const createId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;

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
  const [references, setReferences] =
    useState<readonly PromoReference[]>(PROMO_REFERENCES);
  const referencesRef = useRef<readonly PromoReference[]>(PROMO_REFERENCES);
  const [referenceId, setReferenceId] = useState<string>(
    PROMO_REFERENCES[0]?.id ?? CUSTOM_REFERENCE,
  );
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceDetails, setSourceDetails] = useState<PromoImageDetails | null>(
    null,
  );
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [isDraggingSource, setIsDraggingSource] = useState(false);
  const [isInspectingImage, setIsInspectingImage] = useState(false);
  const [fidelity, setFidelity] = useState<PromoFidelity>("high");
  const [generated, setGenerated] = useState<File[]>([]);
  const [versions, setVersions] = useState<PromoVersion[]>([]);
  const [activeVersionIndex, setActiveVersionIndex] = useState(0);
  const [previews, setPreviews] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [generationModel, setGenerationModel] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const imageSelectionId = useRef(0);

  const reference: PromoReference | undefined =
    referenceId === CUSTOM_REFERENCE
      ? undefined
      : references.find((item) => item.id === referenceId);
  const isUpload = method === "upload";
  const historyKey = `${draft._id}:${method}`;
  const activeVersion = versions[activeVersionIndex];
  const activeStatus = activeVersion?.statuses[activeIndex] ?? "candidate";
  const isBusy = isSaving || isGenerating || isInspectingImage;

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => closeRef.current?.focus(), 0);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isBusy) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isBusy, onClose, open]);

  useEffect(() => {
    if (!open) return;
    setStep("configure");
    setCopy(draft.campaignName ? `${draft.campaignName} — out now` : "");
    setLook("");
    // Reuse the currently loaded admin catalogue when the studio is reopened.
    // Falling back to the built-in id here could leave no visible style selected
    // if the refresh request fails after a previous successful load.
    setReferenceId(referencesRef.current[0]?.id ?? CUSTOM_REFERENCE);
    imageSelectionId.current += 1;
    setIsInspectingImage(false);
    setSourceFile(null);
    setSourceDetails(null);
    setGenerated([]);
    const storedVersions = promoHistoryByDraft.get(historyKey) ?? [];
    setVersions(storedVersions);
    setActiveVersionIndex(Math.max(0, storedVersions.length - 1));
    setActiveIndex(0);
    setGenerationModel(null);
    setError(null);
  }, [draft.campaignName, historyKey, method, open]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    void listPromoReferences()
      .then((loaded) => {
        if (!active || !loaded.length) return;
        referencesRef.current = loaded;
        setReferences(loaded);
        setReferenceId((current) =>
          current === CUSTOM_REFERENCE ||
          loaded.some((item) => item.id === current)
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

  const selectFile = async (file?: File) => {
    if (!file) return;
    const selectionId = ++imageSelectionId.current;
    setIsInspectingImage(true);
    setError(null);
    try {
      // Only a photo the model will work from gets resized. An "upload" is the client's
      // finished artwork, and silently re-encoding their deliverable is not ours to do.
      const prepared = method === "photo" ? await fitPromoImage(file) : file;
      const details = await inspectPromoImage(prepared, method);
      if (selectionId !== imageSelectionId.current) return;
      setSourceFile(prepared);
      setSourceDetails(details);
    } catch (cause) {
      if (selectionId !== imageSelectionId.current) return;
      setError(
        cause instanceof Error
          ? cause.message
          : "The image could not be checked. Try another file.",
      );
    } finally {
      if (selectionId === imageSelectionId.current) setIsInspectingImage(false);
    }
  };

  // The file input is visually hidden, so the zone handles the drop itself. Without
  // preventDefault the browser opens the dropped file and the draft is lost.
  const allowSourceDrag = (event: DragEvent<HTMLLabelElement>) => {
    if (isBusy) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setIsDraggingSource(true);
  };

  const endSourceDrag = (event: DragEvent<HTMLLabelElement>) => {
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget))
      return;
    setIsDraggingSource(false);
  };

  const dropSourceFile = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDraggingSource(false);
    if (isBusy) return;
    void selectFile(event.dataTransfer.files?.[0]);
  };

  const generate = async () => {
    if (isBusy) return;
    if (method === "photo" && !sourceFile) {
      setError("Add the photo you want to work from.");
      return;
    }
    if (copy.trim().length < MIN_COPY_LENGTH) {
      setError(
        `Write what the promo should say — at least ${MIN_COPY_LENGTH} characters.`,
      );
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
      const version: PromoVersion = {
        id: createId(),
        createdAt: new Date().toISOString(),
        files: result.files,
        model: result.model,
        copy: copy.trim(),
        look,
        referenceId,
        fidelity,
        ...(method === "photo" && sourceFile ? { sourceFile } : {}),
        ...(method === "photo" && sourceDetails ? { sourceDetails } : {}),
        statuses: result.files.map(() => "candidate" as const),
      };
      const nextVersions = [...versions, version];
      promoHistoryByDraft.set(historyKey, nextVersions);
      setVersions(nextVersions);
      setActiveVersionIndex(nextVersions.length - 1);
      setGenerated(result.files);
      setGenerationModel(result.model);
      setActiveIndex(0);
      setStep("review");
      onGenerated?.(result.files.length, nextVersions.length);
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

  const openVersion = (index: number) => {
    const version = versions[index];
    if (!version) return;
    setActiveVersionIndex(index);
    setGenerated(version.files);
    setGenerationModel(version.model);
    setCopy(version.copy);
    setLook(version.look);
    setReferenceId(version.referenceId);
    setFidelity(version.fidelity);
    setSourceFile(version.sourceFile ?? null);
    setSourceDetails(version.sourceDetails ?? null);
    setActiveIndex(0);
    setStep("review");
    setError(null);
  };

  const setActiveStatus = (status: PromoOptionStatus) => {
    const nextVersions = versions.map((version, versionIndex) =>
      versionIndex === activeVersionIndex
        ? {
            ...version,
            statuses: version.statuses.map((current, optionIndex) =>
              optionIndex === activeIndex ? status : current,
            ),
          }
        : version,
    );
    promoHistoryByDraft.set(historyKey, nextVersions);
    setVersions(nextVersions);
  };

  const approve = async () => {
    if (isBusy) return;
    const file = isUpload ? sourceFile : generated[activeIndex];
    if (!file) {
      setError(
        isUpload ? "Choose the finished promo first." : "Create a promo first.",
      );
      return;
    }
    if (!isUpload && activeStatus === "rejected") {
      setError("Restore this option before using it, or choose another one.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const assetUrl = await uploadImageApi(file);
      let sourceAssetUrl: string | undefined;
      const approvalSource = activeVersion?.sourceFile ?? sourceFile;
      if (method === "photo" && approvalSource) {
        sourceAssetUrl = await uploadImageApi(approvalSource);
      }

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
      if (!isUpload) setActiveStatus("approved");
      onClose();
    } catch {
      setError(
        "The promo could not be saved. Check the connection and try again.",
      );
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
          disabled={isBusy}
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
              {!isUpload && versions.length > 0 && (
                <button
                  type="button"
                  className={styles.historyShortcut}
                  onClick={() => openVersion(versions.length - 1)}
                >
                  <span>Previous versions</span>
                  <b>{versions.length}</b>
                </button>
              )}

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
                    accept={ACCEPTED_IMAGE_ACCEPT}
                    disabled={isBusy}
                    onChange={(event) => {
                      const file = event.currentTarget.files?.[0];
                      event.currentTarget.value = "";
                      void selectFile(file);
                    }}
                  />
                  {sourcePreview ? (
                    <>
                      <img src={sourcePreview} alt="Selected" />
                      {sourceDetails && (
                        <small className={styles.imageDetails}>
                          {sourceDetails.width} × {sourceDetails.height} px
                        </small>
                      )}
                    </>
                  ) : (
                    <span>
                      <b>
                        {isInspectingImage
                          ? "Checking image…"
                          : isDraggingSource
                            ? "Release to add the image"
                            : isUpload
                              ? "Drop your finished promo here"
                              : "Drop the photo to work from"}
                      </b>
                      <small>
                        JPG, PNG, or WebP · at least 512 × 512 px · up to{" "}
                        {MAX_PROMO_IMAGE_MB} MB
                        {isUpload ? " · formats from 1:2 to 2:1" : ""}
                      </small>
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
                    Write the words exactly as they should appear. The image
                    model prints them onto the artwork.
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
                      className={
                        fidelity === "high" ? styles.segmentedActive : ""
                      }
                      onClick={() => setFidelity("high")}
                    >
                      <b>Keep my photo</b>
                      <small>Stay close to the original</small>
                    </button>
                    <button
                      type="button"
                      className={
                        fidelity === "low" ? styles.segmentedActive : ""
                      }
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
                      className={
                        referenceId === item.id ? styles.referenceSelected : ""
                      }
                      onClick={() => setReferenceId(item.id)}
                    >
                      <img src={item.preview} alt="" />
                      <b>{item.name}</b>
                    </button>
                  ))}
                  <button
                    type="button"
                    className={`${styles.referenceCustom} ${
                      referenceId === CUSTOM_REFERENCE
                        ? styles.referenceSelected
                        : ""
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
                <img
                  className={styles.result}
                  src={previews[activeIndex]}
                  alt="Promo option"
                />
              )}
              {previews.length > 1 && (
                <>
                  <button
                    type="button"
                    className={`${styles.carouselArrow} ${styles.carouselArrowPrev}`}
                    onClick={() =>
                      setActiveIndex(
                        (activeIndex + previews.length - 1) % previews.length,
                      )
                    }
                    aria-label="Previous option"
                    disabled={isBusy}
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    className={`${styles.carouselArrow} ${styles.carouselArrowNext}`}
                    onClick={() =>
                      setActiveIndex((activeIndex + 1) % previews.length)
                    }
                    aria-label="Next option"
                    disabled={isBusy}
                  >
                    →
                  </button>
                </>
              )}
            </div>

            <div className={styles.reviewInfo}>
              <div className={styles.versionHistory}>
                <div>
                  <span>Generation history</span>
                  <strong>
                    Version {activeVersionIndex + 1} of {versions.length}
                  </strong>
                  <small className={styles[`status_${activeStatus}`]}>
                    {activeStatus === "candidate"
                      ? "Candidate"
                      : activeStatus === "rejected"
                        ? "Rejected"
                        : "Approved"}
                  </small>
                </div>
                <div className={styles.versionActions}>
                  <button
                    type="button"
                    onClick={() => openVersion(activeVersionIndex - 1)}
                    disabled={isBusy || activeVersionIndex === 0}
                    aria-label="Previous version"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => openVersion(activeVersionIndex + 1)}
                    disabled={
                      isBusy || activeVersionIndex >= versions.length - 1
                    }
                    aria-label="Next version"
                  >
                    →
                  </button>
                </div>
              </div>

              <div className={styles.filmstrip} aria-label="Promo options">
                {previews.map((preview, index) => (
                  <button
                    key={preview}
                    type="button"
                    className={
                      index === activeIndex ? styles.filmstripActive : ""
                    }
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Show option ${index + 1}`}
                    aria-current={index === activeIndex ? "true" : undefined}
                    disabled={isBusy}
                  >
                    <img src={preview} alt="" />
                    <small>
                      {activeVersion?.statuses[index] === "rejected"
                        ? "Rejected"
                        : index + 1}
                    </small>
                  </button>
                ))}
              </div>

              <button
                type="button"
                className={styles.rejectOption}
                onClick={() =>
                  setActiveStatus(
                    activeStatus === "rejected" ? "candidate" : "rejected",
                  )
                }
                disabled={isBusy || activeStatus === "approved"}
              >
                {activeStatus === "approved"
                  ? "Approved option"
                  : activeStatus === "rejected"
                    ? "Restore this option"
                    : "Reject this option"}
              </button>

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
                disabled={isBusy}
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
          disabled={isBusy}
        >
          Back
        </button>
        <div>
          {step === "configure" && !isUpload && (
            <button
              type="button"
              className={styles.primary}
              onClick={() => void generate()}
              disabled={isBusy}
            >
              {isGenerating ? "Creating…" : "Create"}
            </button>
          )}
          {(step === "review" || isUpload) && (
            <button
              type="button"
              className={styles.primary}
              onClick={() => void approve()}
              disabled={isBusy || (!isUpload && activeStatus === "rejected")}
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
        if (event.target === event.currentTarget && !isBusy) onClose();
      }}
    >
      {studio}
    </div>,
    document.body,
  );
};
