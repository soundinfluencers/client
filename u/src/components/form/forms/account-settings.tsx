import type {
  RegisterOptions,
  FieldValues,
  UseFormRegisterReturn,
} from "react-hook-form";
import { FormInput } from "../../ui/inputs/form-input/form-attributes";
import {
  renderInputs,
  renderTextAreas,
} from "../renderFunctions/input-textAreas";

export function AccountSettingsForm({
  data,
  register,
  errors,
}: {
  data: any;
  register: any;
  errors: any;
}) {
  console.log(data, "awijfwaijfawfwaj;i");
  return (
    <>
      <div className="inputs">
        <FormInput
          label="First name"
          name={data.firstName}
          placeholder={data.firstName}
          register={register}
        />
        <FormInput
          label="Last name"
          name={data.lastName}
          placeholder={data.lastName}
          register={register}
        />
        <FormInput
          label="Company name"
          name={data.company}
          placeholder={data.company}
          register={register}
        />
        <FormInput
          label="Phone number"
          name={data.phone}
          placeholder={data.phone}
          register={register}
        />{" "}
        <FormInput
          label="Email"
          name={data.email}
          placeholder={data.email}
          register={register}
        />
      </div>
    </>
  );
}
export function InvoiceSettingsForm({
  data,
  register,
  errors,
}: {
  data: any;
  register: any;
  errors: any;
}) {
  console.log(data, "InvoiceSettingsForm");
  return (
    <>
      <div className="inputs">
        <FormInput
          label="First name"
          name={data.firstName}
          placeholder={data.firstName}
          register={register}
        />
        <FormInput
          label="Last name"
          name={data.lastName}
          placeholder={data.lastName}
          register={register}
        />
        <FormInput
          label="Address"
          name={data.address}
          placeholder={data.address}
          register={register}
        />{" "}
        <FormInput
          label="Company"
          name={data.company}
          placeholder={data.company}
          register={register}
        />
        <FormInput
          label="Country"
          name={data.country}
          placeholder={data.company}
          register={register}
        />
        <FormInput
          label="VAT number (only if VAT registered)"
          name={data.VAT}
          placeholder={data.VAT}
          register={register}
        />{" "}
      </div>
    </>
  );
}
