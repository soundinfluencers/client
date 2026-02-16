import { useEffect, useState } from "react";
import { useFormContext, type Path, useController, type FieldValues } from "react-hook-form";
import './_base-input.scss';

type BaseInputType = "text" | "number" | "email" | "password" | "numeric";

interface BaseInputProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  placeholder?: string;
  type?: BaseInputType;
  disabled?: boolean;
}

const sanitizeDigits = (raw: string) => raw.replace(/\D/g, "");
const sanitizeNumber = (raw: string) => {
  let s = raw.replace(/,/g, ".").replace(/[^\d.-]/g, "");

  s = s.replace(/(?!^)-/g, "");

  const firstDot = s.indexOf(".");
  if (firstDot !== -1) {
    s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, "");
  }

  return s;
};

export function BaseInput<T extends FieldValues>({
                                                   name,
                                                   label,
                                                   placeholder,
                                                   type = "text",
                                                   disabled = false,
                                                 }: BaseInputProps<T>) {
  const { control, setValue, getValues, clearErrors } = useFormContext<T>();

  const { field, fieldState } = useController({ control, name });
  const error = fieldState.error;

  const isNumeric = type === "number" || type === "numeric";

  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    if (!isNumeric) return;

    const v = field.value as unknown;

    if (v === null || v === undefined || v === "") {
      setDisplayValue("");
      return;
    }

    setDisplayValue(String(v));
  }, [field.value, isNumeric]);

  const commitNumericToForm = (raw: string) => {
    if (raw === "" || raw === "-" || raw === ".") {
      field.onChange(null);
      return;
    }

    const num = Number(raw);
    field.onChange(Number.isFinite(num) ? num : null);
  };

  if (!isNumeric) {
    return (
      <div className="base-input">
        {label && (
          <label
            className={`base-input__label ${error ? "base-input__label--error" : ""}`}
            htmlFor={name}
          >
            {label}
          </label>
        )}

        <input
          className={`base-input__field ${error ? "base-input__field--error" : ""}`}
          ref={field.ref}
          name={name}
          id={name}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          value={field.value ?? ""}
          onChange={field.onChange}
          onBlur={field.onBlur}
        />
        {error && <p className="base-input__error-message">{error?.message}</p>}
      </div>
    );
  }

  return (
    <div className="base-input">
      {label && (
        <label
          className={`base-input__label ${error ? "base-input__label--error" : ""} ${disabled ? "base-input__label--disabled" : ""}`}
          htmlFor={name}
        >
          {label}
        </label>
      )}

      <input
        id={name}
        name={name}
        className={`base-input__field ${error ? "base-input__field--error" : ""}`}
        ref={field.ref}
        placeholder={placeholder}
        type={'text'}
        inputMode={'numeric'}
        pattern={type === 'numeric' ? "[0-9]*" : undefined}
        disabled={disabled}
        value={displayValue}
        onChange={(e) => {
          if (/\D/.test(e.target.value)) {
            // If non-digit characters are present, ignore the change
            return;
          }
          const raw = e.target.value;
          const next = type === "numeric" ? sanitizeDigits(raw) : sanitizeNumber(raw);

          setDisplayValue(next);
          clearErrors(name);
          commitNumericToForm(next);
        }}
        onBlur={() => {
          setValue(name, getValues(name), {
            shouldTouch: true,
            shouldValidate: false,
          });
        }}
      />
      {error && <p className="base-input__error-message">{error?.message}</p>}
    </div>
  );
}


// interface Props {
//   name: string;
//   label: string;
//   placeholder?: string;
//   type?: string;
//   disabled?: boolean;
// }
//
// export const BaseInput: React.FC<Props> = ({
//                                              name,
//                                              label,
//                                              placeholder,
//                                              type = "text",
//                                            }) => {
//   const { control } = useFormContext();
//
//   return (
//     <Controller
//       control={control}
//       name={name}
//       render={({ field, fieldState }) => {
//         const error = fieldState.error;
//
//         // console.log(error?.message);
//         // console.log('Rendering BaseInput with:', { name, label, placeholder, type, error });
//
//         return (
//           <div className="custom-input">
//             {label && (
//               <label
//                 className={`custom-input__label ${error ? "custom-input__label--error" : ""}`}
//                 htmlFor={name}
//               >
//                 {label}
//               </label>
//             )}
//
//             <input
//               className={`custom-input__field ${error ? "custom-input__field--error" : ""}`}
//               id={name}
//               type={type}
//               placeholder={placeholder}
//               value={field.value ?? ""}
//               onBlur={field.onBlur}
//               name={field.name}
//               ref={field.ref}
//               onChange={(e) => {
//                 //correct handle number value
//                 field.onChange(type === "number" ? Number(e.target.value) : e.target.value);
//               }}
//             />
//             {error && <p className="custom-input__error-message">{error?.message}</p>}
//           </div>
//         );
//       }}
//     />
//   );
// };