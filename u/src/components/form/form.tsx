import {
  useForm,
  type FieldValues,
  type RegisterOptions,
  type UseFormRegisterReturn,
} from "react-hook-form";
import type { FormSchema } from "./schemas";
import {
  FormInput,
  FormTextArea,
} from "../ui/inputs/form-input/form-attributes";
import "./_form.scss";
import type { PlattformsDataFormProps } from "../../types/form/plattforms-data-form.types";
interface FormSection {
  data: PlattformsDataFormProps;
  className?: string;
}

type DynamicFormData = Record<string, string>;

export default function Form({ data, className }: FormSection) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<DynamicFormData>();
  const onSubmit = async () => {
    try {
      console.log("sent");
      reset();
    } catch (error) {}
  };
  return (
    <form
      className={`form ${className}`}
      onSubmit={handleSubmit(onSubmit)}
      noValidate>
      {" "}
      {data.headInput && (
        <FormInput<FormSchema>
          label={data.headInput.name}
          name={data.headInput.name}
          placeholder={data.headInput.placeholder}
          register={register}
          required
          error={errors.name}
        />
      )}
      {data.contentTitle && <p className="labelForm">{data.contentTitle} 1</p>}
      <div className="inputs">
        {data.inputs.length > 0 &&
          data.inputs.map((input, i) => (
            <FormInput
              key={i}
              label={input.name}
              name={input.name}
              placeholder={input.placeholder}
              register={register}
              error={errors[input.name]}
            />
          ))}{" "}
        {Array.isArray(data.textAreas) &&
          data.textAreas.map((textArea, i) => (
            <FormTextArea<FormSchema>
              key={i}
              name={textArea.name}
              label={textArea.name}
              placeholder={textArea.placeholder}
              register={register}
              required={false}
              error={errors[textArea.name]}
            />
          ))}
      </div>
      <div className="button-section">
        <button>Add additional {data.contentTitle.toLocaleLowerCase()} </button>
        <button className="submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Continue"}
        </button>
      </div>
    </form>
  );
}
