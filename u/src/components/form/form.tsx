import { useForm } from "react-hook-form";

import type { FormSchema } from "./schemas";

// reusable form with ZOD validation //

import {
  FormInput,
  FormTextArea,
} from "../ui/inputs/form-input/form-attributes";
import "./_form.scss";
import type { IPlattformsDataFormProps } from "../../types/form/plattforms-data-form.types";
import type { IBespokeCampaignTabData } from "../../types/form/bespoke-campaign-tabs-data";
import type { IPaymentCampaignField } from "../../types/form/payment-campaign-inputs";

// interface FormSection includes data reliable to form //

interface FormSection {
  data?: IPlattformsDataFormProps | IBespokeCampaignTabData;
  paymentData?: IPaymentCampaignField;
  className?: string;
}

type DynamicFormData = Record<string, string>;

export default function Form({ data, className, paymentData }: FormSection) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<DynamicFormData>();

  const onSubmit = async () => {
    console.log("sent");
    reset();
  };

  const isPlatformForm = data?.formType === "platform";
  const isBespokeForm = data?.formType === "bespoke";
  const isPaymentForm = paymentData?.formType === "payment";

  return (
    <form
      className={`form ${className}`}
      onSubmit={handleSubmit(onSubmit)}
      noValidate>
      {isPlatformForm && data.headInput && (
        <FormInput
          label={data.headInput.name}
          name={data.headInput.name}
          placeholder={data.headInput.placeholder}
          register={register}
          required
          error={errors[data.headInput.name]}
        />
      )}

      {isPlatformForm && data.contentTitle && (
        <p className="labelForm">{data.contentTitle}</p>
      )}

      <div className="inputs">
        {isPlatformForm &&
          data.inputs.map((input, i) => (
            <FormInput
              key={i}
              label={input.name}
              name={input.name}
              placeholder={input.placeholder}
              register={register}
              error={errors[input.name]}
            />
          ))}
        {isPaymentForm &&
          paymentData.inputs.map((input, i) => (
            <FormInput
              key={i}
              label={input.name}
              name={input.name}
              placeholder={input.placeholder}
              register={register}
              error={errors[input.name]}
            />
          ))}
        {isPlatformForm &&
          Array.isArray(data.textAreas) &&
          data.textAreas.map((textArea, i) => (
            <FormTextArea
              key={i}
              name={textArea.name}
              label={textArea.name}
              placeholder={textArea.placeholder}
              register={register}
              error={errors[textArea.name]}
            />
          ))}

        {isBespokeForm &&
          data.inputs.map((input) => (
            <FormInput
              key={input.name}
              label={input.label}
              name={input.name}
              placeholder={input.placeholder}
              register={register}
              error={errors[input.name]}
            />
          ))}
        {isBespokeForm &&
          data.textAreas &&
          data.textAreas.map((input) => (
            <FormTextArea
              isBespoke={true}
              key={input.name}
              label={input.name}
              name={input.name}
              placeholder={input.placeholder}
              register={register}
              error={errors[input.name]}
            />
          ))}
      </div>

      <div className="button-section">
        {isPlatformForm && (
          <button>Add additional {data.contentTitle?.toLowerCase()}</button>
        )}
        {isPlatformForm && (
          <button className="submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Continue"}
          </button>
        )}{" "}
        {isBespokeForm && (
          <button className="submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Create"}
          </button>
        )}
      </div>
    </form>
  );
}
