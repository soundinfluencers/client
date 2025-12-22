import React, { useMemo, useRef } from 'react';
import type { FieldError } from "react-hook-form";
import paperClip from '../../../../../../../../assets/icons/paperclip.svg';
import trash from '../../../../../../../../assets/icons/trash-2.svg';
import './_logo-upload.scss';

interface Props {
  value?: File | null;
  error?: FieldError,
  onChange: (file: File | null) => void;
}

export const LogoUpload: React.FC<Props> = ({ value, onChange, error }) => {
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
    <div className={`form-input ${error ? 'error' : ''}`}>
      <label>Logo</label>

      <div className={`logo-input ${preview ? 'logo-input--preview' : ''}`} onClick={!preview ? openFileDialog : undefined}>
        <input
          ref={inputRef}
          type="file"
          accept='image/*'
          hidden
          onChange={handleSelect}
        />
        {preview ? (
          <>
            <img src={preview} alt="User Logo" className='logo-input__logo'/>
            <button type='button' onClick={handleRemove} className='logo-input__remove'>
              <img src={trash} alt='Trash container'/>
            </button>
          </>
        ) : (
          <>
            <span>Attach the logo for your brand here</span>
            <img src={paperClip} alt="Paper clip" />
          </>
        )}
      </div>
    </div>
  );
};