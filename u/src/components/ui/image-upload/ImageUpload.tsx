import React, { useMemo, useRef, useState } from "react";
import type { FieldError } from "react-hook-form";
import paperClip from "../../../assets/icons/paperclip.svg";
import trash from "../../../assets/icons/trash-2.svg";
import x from "../../../assets/icons/x.svg";
import "./_image-upload.scss";
import { uploadImageApi } from "@/api/upload/upload-image.api";
import { SmallLoader } from "@components/ui/small-loader/SmallLoader.tsx";

interface Props {
  name: string;
  label: string;
  placeholder: string;
  description?: string;

  size: "small" | "large";
  value: string | null;
  onChange: (file: string | null) => void;
  error?: FieldError;
}

//TODO: api load image during setup img, mb setup loader absolut positioned on input

export const ImageUpload: React.FC<Props> = ({
  value,
  onChange,
  error,
  description,
  name,
  label,
  placeholder,
  size = "small",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const preview = useMemo(() => {
    if (!value) return null;
    // return typeof value === 'string' ? value : URL.createObjectURL(value);
    return value;
  }, [value]);

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    // console.log(file);
    if (!file) return;

    try {
      setIsLoading(true);
      const imageUrl = await uploadImageApi(file);
      // console.log(imageUrl);
      onChange(imageUrl);
    } catch (error) {
      //TODO: impl toaster error message
      console.error("Error uploading image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    onChange(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

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
              accept="image/*"
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
      {error && <p className="image-input__error">{error.message}</p>}
      {description && <p className="image-input__description">{description}</p>}
    </div>
  );
};
