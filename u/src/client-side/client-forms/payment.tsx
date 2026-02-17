import { CountryField } from "@/pages/influencer/shared/components/CountryField";
import { FormInput } from "@/shared/ui";
import { renderInputs } from "@/shared/ui/form/renderFunctions/input-textAreas";
import type { IPaymentCampaignField } from "@/types/client/form-clients/payment-campaign-inputs";

export function PaymentForm({ data }: { data: IPaymentCampaignField }) {
  return (
    <>
      <div className="inputs">
        <FormInput
          required
          id="firstName"
          key="firstName"
          label="First name"
          name="firstName"
          placeholder="Enter first name"
        />
        <FormInput
          required
          id="lastName"
          key="lastName"
          label="Last name"
          name="lastName"
          placeholder="Enter last name"
        />
        <FormInput
          required
          id="address"
          key="address"
          label="Address"
          name="address"
          placeholder="Enter address"
        />{" "}
        <FormInput
          id="company"
          name="company"
          label="Company (optional)"
          placeholder="Enter company"
        />
        <CountryField
          name="country"
          placeholder="Enter Country"
          label="Country*"
        />
        <FormInput
          id="vatNumber"
          key="vatNumber"
          label="VAT number (only if VAT registered)"
          name="vatNumber"
          placeholder="Enter VAT number"
        />
      </div>
    </>
  );
}
