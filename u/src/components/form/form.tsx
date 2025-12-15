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
import type { IUser } from "../../types/user/user.types";
import { PlatformForm } from "./forms/plattform";
import { BespokeForm } from "./forms/bespoke";
import { PaymentForm } from "./forms/payment";
import {
  AccountSettingsForm,
  InvoiceSettingsForm,
} from "./forms/account-settings";

// interface FormSection includes data reliable to form //

interface FormSection {
  data?: IPlattformsDataFormProps | IBespokeCampaignTabData;
  paymentData?: IPaymentCampaignField;
  accountSettings?: any;
  invoiceSettings?: any;
  className?: string;
}

type DynamicFormData = Record<string, string>;

export default function Form({
  data,
  className,
  paymentData,
  accountSettings,
  invoiceSettings,
}: FormSection) {
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
      {isPlatformForm && (
        <PlatformForm data={data} register={register} errors={errors} />
      )}
      {isBespokeForm && (
        <BespokeForm data={data} register={register} errors={errors} />
      )}
      {isPaymentForm && (
        <PaymentForm data={paymentData} register={register} errors={errors} />
      )}
      {accountSettings && (
        <AccountSettingsForm
          data={accountSettings}
          register={register}
          errors={errors}
        />
      )}
      {invoiceSettings && (
        <InvoiceSettingsForm
          data={invoiceSettings}
          register={register}
          errors={errors}
        />
      )}
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
        )}{" "}
        {accountSettings && (
          <button className="submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "SAVE"}
          </button>
        )}
      </div>
    </form>
  );
}
