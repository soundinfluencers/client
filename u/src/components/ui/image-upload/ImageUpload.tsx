import React, { useEffect, useMemo, useRef, useState } from "react";
import { type FieldValues, type Path, useController, useFormContext } from "react-hook-form";
import paperClip from "../../../assets/icons/paperclip.svg";
import trash from "../../../assets/icons/trash-2.svg";
import x from "../../../assets/icons/x.svg";
import "./_image-upload.scss";
import { uploadImageApi } from "@/api/upload/upload-image.api";
import { SmallLoader } from "@components/ui/small-loader/SmallLoader.tsx";
import { handleApiError } from "@/api/error.api.ts";

// Optional lifecycle for owned uploads. The standard picker/preview and default
// upload behaviour stay shared with the existing form consumers.
export interface ImageUploadOptions {
  contextKey: string;
  isCurrent: () => boolean;
  onPendingChange?: (pending: boolean) => void;
  accept?: string;
  createController: (deps: {
    upload: (file: File, signal: AbortSignal, isCurrent?: () => boolean) => Promise<string>;
    live: () => boolean;
    apply: (url: string | null) => void;
    changed: () => void;
  }) => {
    state: () => { pending: boolean; error: string };
    select: (file: File) => Promise<void>;
    remove: () => void;
    dispose: () => void;
  };
}

interface Props<T extends FieldValues> {
  name: Path<T>;
  label: string;
  placeholder: string;
  description?: string;

  size: "small" | "large";
  uploadOptions?: ImageUploadOptions;
  // value: string | null;
  // onChange: (file: string | null) => void;
  // error?: FieldError;
}

export function ImageUpload<T extends FieldValues>({
  // value,
  // onChange,
  // error,
  description,
  name,
  label,
  placeholder,
  size = "small",
  uploadOptions,
}: Props<T>) {
  const { control } = useFormContext<T>();
  const { field, fieldState } = useController({ control, name });

  const [isLoading, setIsLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const current = useRef({ uploadOptions, apply: field.onChange });
  current.current = { uploadOptions, apply: field.onChange };
  const mounted = useRef(true);
  const contextKey = uploadOptions?.contextKey;
  const createController = uploadOptions?.createController;
  const consumer = useMemo(() => {
    if (!createController) return undefined;
    const controller = createController({
      upload: (file, signal, isCurrent) => uploadImageApi(file, { signal, isCurrentRequest: isCurrent, silentReadError: true }),
      live: () => mounted.current && current.current.uploadOptions?.contextKey === contextKey && current.current.uploadOptions?.isCurrent() === true,
      apply: url => current.current.apply(url),
      changed: () => {
        const state = controller.state();
        current.current.uploadOptions?.onPendingChange?.(state.pending);
        setIsLoading(state.pending); setUploadError(state.error);
      },
    });
    return controller;
  }, [contextKey, createController]);
  useEffect(() => {
    mounted.current = true; setIsLoading(false); setUploadError('');
    const onPendingChange = current.current.uploadOptions?.onPendingChange;
    return () => { mounted.current = false; consumer?.dispose(); onPendingChange?.(false); };
  }, [consumer]);

  const preview = useMemo(() => {
    if (!field.value) return null;
    // return typeof value === 'string' ? value : URL.createObjectURL(value);
    return field.value;
  }, [field.value]);

  const openFileDialog = () => {
    if (uploadOptions && !uploadOptions.isCurrent()) return;
    inputRef.current?.click();
  };

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    // console.log(file);
    if (!file) return;
    if (consumer) {
      // Allow another selection of the same file after a failed attempt.
      e.target.value = '';
      await consumer.select(file);
      return;
    }

    try {
      setIsLoading(true);
      const imageUrl = await uploadImageApi(file);
      // console.log(imageUrl);
      // onChange(imageUrl);
      field.onChange(imageUrl);
    } catch (error) {
      //TODO: impl toaster error message
      // console.error("Error uploading image:", error);
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    if (consumer) {
      if (!uploadOptions?.isCurrent()) return;
      consumer.remove();
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    // onChange(null);
    field.onChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const error = uploadError ? { message: uploadError } : fieldState.error;

  return (
    <div className="image-input">
      <label
        className={`image-input__label ${error ? "image-input__label--error" : ""}`}
        htmlFor={name}>
        {label}
      </label>

      <div
        className={`image-input__field ${preview ? `image-input__field--preview-${size}` : ""} ${error ? "image-input__field--error" : ""}`}
        onClick={!preview ? openFileDialog : undefined}>
        {isLoading ? (
          <SmallLoader />
        ) : (
          <>
            <input
              id={name}
              ref={inputRef}
              type="file"
              accept={uploadOptions?.accept ?? 'image/*'}
              hidden
              onChange={handleSelect}
            />
            {preview ? (
              <>
                <div className={`image-input__wrapper`}>
                  <img
                    className={`image-input__image--${size}`}
                    src={preview}
                    alt="User image"
                  />
                  {size === "large" && (
                    <button
                      type="button"
                      onClick={handleRemove}
                      className="image-input__wrapper-remove">
                      <img src={x} alt="Remove" />
                    </button>
                  )}
                </div>
                {size === "small" && (
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="image-input__remove">
                    <img src={trash} alt="Trash container" />
                  </button>
                )}
                {size === "large" && (
                  <button
                    type="button"
                    className="image-input__add"
                    disabled={preview !== null}>
                    <img src={paperClip} alt="Paper clip" />
                  </button>
                )}
              </>
            ) : (
              <>
                <span className="image-input__placeholder">{placeholder}</span>
                <button type="button" className="image-input__add">
                  <img src={paperClip} alt="Paper clip" />
                </button>
              </>
            )}
          </>
        )}
      </div>
      <p
        className={`image-input__error-message ${error ? 'image-input__error-message--show' : ''}`}
        aria-live="polite"
      >
        {error?.message}
      </p>
      {description && <p className="image-input__description">{description}</p>}
    </div>
  );
}
