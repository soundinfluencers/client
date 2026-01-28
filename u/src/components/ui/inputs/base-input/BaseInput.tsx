import './_base-input.scss';
import { Controller, useFormContext } from "react-hook-form";

interface Props {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
}

export const BaseInput: React.FC<Props> = ({
  name,
  label,
  placeholder,
  type = "text",
}) => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const hasError = fieldState.invalid;

        return (
          <div className="custom-input">
            {label && (
              <label
                className={`custom-input__label ${hasError ? "custom-input__label--error" : ""}`}
                htmlFor={name}
              >
                {label}
              </label>
            )}

            <input
              className={`custom-input__field ${hasError ? "custom-input__field--error" : ""}`}
              id={name}
              type={type}
              placeholder={placeholder}
              value={field.value ?? ""}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
              onChange={(e) => {
                //correct handle number value
                field.onChange(type === "number" ? Number(e.target.value) : e.target.value);
              }}
            />
          </div>
        );
      }}
    />
  );
};

{/* {error && (
        <span className="custom-input__error-message">
          {error}
        </span>
      )} */}