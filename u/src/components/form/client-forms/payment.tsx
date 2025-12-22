import type { IPaymentCampaignField } from "../../../types/form/payment-campaign-inputs";
import {
  renderInputs,
  renderTextAreas,
} from "../renderFunctions/input-textAreas";

export function PaymentForm({ data }: { data: IPaymentCampaignField }) {
  return (
    <>
      <div className="inputs">{data.inputs && renderInputs(data.inputs)}</div>
    </>
  );
}
