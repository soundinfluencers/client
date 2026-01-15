import './_base-input.scss';
import { useFormContext } from "react-hook-form";

interface Props {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
};

export const BaseInput: React.FC<Props> = ({
  name,
  label,
  placeholder,
  type = "text",
  required = false
}) => {
  const { register, formState: { errors } } = useFormContext();

  const error = errors?.[name]?.message as string | undefined;

  return (
    <div className={`custom-input ${error ? 'custom-input--error' : ''}`}>
      {label && (
        <label className="custom-input__label" htmlFor={name}>
          {label}
        </label>
      )}
      <input
        className={`custom-input__field`}
        id={name}
        type={type}
        placeholder={placeholder}
        {...register(name, { required, valueAsNumber: type === 'number' })}
      />
      {error && (
        <span className="custom-input__error-message">
          {error}
        </span>
      )}
    </div>
  );
};
