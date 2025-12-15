import type { IPaymentCampaignField } from "../../../types/form/payment-campaign-inputs";
import {
  renderInputs,
  renderTextAreas,
} from "../renderFunctions/input-textAreas";

export function PaymentForm({
  data,
  register,
  errors,
}: {
  data: IPaymentCampaignField;
  register: any;
  errors: any;
}) {
  return (
    <>
      <div className="inputs">
        {data.inputs && renderInputs(data.inputs, register, errors)}
      </div>
    </>
  );
}
