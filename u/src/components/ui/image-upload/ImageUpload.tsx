import React, { useMemo, useRef } from 'react';
import type { FieldError } from "react-hook-form";
import paperClip from '../../../assets/icons/paperclip.svg';
import trash from '../../../assets/icons/trash-2.svg';
import x from '../../../assets/icons/x.svg';
import './_image-upload.scss';

interface Props {
  name: string;
  label: string;
  placeholder: string;
  description?: string;

  size: 'small' | 'large';
  value: File | null;
  error?: FieldError,
  onChange: (file: File | null) => void;
};

//TODO: api load image during setup img

export const ImageUpload: React.FC<Props> = ({
  value,
  onChange,
  error,
  description,
  name,
  label,
  placeholder,
  size = 'small' }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const preview = useMemo(() => {
    if (!value) return null;
    return typeof value === 'string' ? value : URL.createObjectURL(value);
  }, [value]);

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    onChange(file);
  };

  const handleRemove = () => {
    onChange(null);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className='image-input'>
      <label className='image-input__label' htmlFor={name}>{label}</label>

      <div className={`image-input__field ${preview ? `image-input__field--preview-${size}` : ''}`} onClick={!preview ? openFileDialog : undefined}>
        <input
          id={name}
          ref={inputRef}
          type="file"
          accept='image/*'
          hidden
          onChange={handleSelect}
        />
        {preview ? (
          <>
            <div className={`image-input__wrapper`}>
              <img src={preview} alt="User image" className={`image-input__image--${size}`} />
              {size === 'large' && (
                <button
                  type='button'
                  onClick={handleRemove}
                  className='image-input__wrapper-remove'
                >
                  <img src={x} alt="Remove" />
                </button>
              )}
            </div>
            {size === 'small' && (
              <button type='button' onClick={handleRemove} className='image-input__remove'>
                <img src={trash} alt='Trash container' />
              </button>
            )}
            {size === 'large' && (
              <button type='button' className='image-input__add' disabled={preview !== null}>
                <img src={paperClip} alt="Paper clip" />
              </button>
            )}
          </>
        ) : (
          <>
            <span className='image-input__placeholder'>{placeholder}</span>
            <button type='button' className='image-input__add'>
              <img src={paperClip} alt="Paper clip" />
            </button>
          </>
        )}
      </div>

      {description && <p className='image-input__description'>{description}</p>}
    </div>
  );
};