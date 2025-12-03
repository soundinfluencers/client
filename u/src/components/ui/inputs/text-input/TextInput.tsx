import type { FC, ChangeEvent } from "react";
import { useState, useEffect } from "react";
import "./_text-input.scss";

export interface TextInputProps {
  value: string;
  setValue: (value: string) => void;
  title?: string;
  type?: string;
  placeholder?: string;
  isError?: boolean;
}

export const TextInput: FC<TextInputProps> = ({
  value,
  setValue,
  title,
  type = "text",
  placeholder,
  isError = false,
}: TextInputProps) => {
  const [maskedValue, setMaskedValue] = useState("");

  useEffect(() => {
    if (type === "password") {
      setMaskedValue("*".repeat(value.length));
    } else {
      setMaskedValue(value);
    }
  }, [value, type]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (type === "password") {
      const diff = inputValue.length - maskedValue.length;
      if (diff > 0) {
        setValue(value + inputValue.slice(-diff));
      } else if (diff < 0) {
        setValue(value.slice(0, diff));
      }
    } else {
      setValue(inputValue);
    }
  };

  return (
    <div className={`text-input ${isError ? "error" : ""}`}>
      {title && <p className="text-input__title">{title}</p>}

      <input
        className="text-input__input"
        type="text"
        value={maskedValue}
        onChange={handleChange}
        placeholder={placeholder}
        style={{ marginTop: title ? 8 : 0 }}
      />
    </div>
  );
};
