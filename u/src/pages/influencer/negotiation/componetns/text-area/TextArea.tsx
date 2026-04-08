import './_text-area.scss';
import { type FieldValues, type Path, useController, useFormContext } from "react-hook-form";

interface TextAreaProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  placeholder?: string;
}

export function TextArea<T extends FieldValues>({
  name,
  label = "Message",
  placeholder = "Enter message here....",
}: TextAreaProps<T>) {
  const { control } = useFormContext<T>();
  const { field, fieldState } = useController({ control, name });

  return (
    <div className="text-area">
      <label className={`text-area__label ${fieldState.error ? 'text-area__label--error' : ''}`} htmlFor={String(name)}>
        {label}
      </label>

      <textarea
        id={String(name)}
        className={`text-area__field ${fieldState.error ? 'text-area__field--error' : ''}`}
        placeholder={placeholder}
        {...field}
      />


      <p
        className={`text-area__error ${fieldState.error ? 'text-area__error--show' : ''}`}
        aria-live={'polite'}
      >
        {fieldState.error?.message}
      </p>
    </div>
  );
}
