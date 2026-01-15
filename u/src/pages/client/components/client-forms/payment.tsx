import type { IPaymentCampaignField } from "@/types/client/form-clients/payment-campaign-inputs";
import {
  renderInputs,
  renderTextAreas,
} from "../../../../components/form/renderFunctions/input-textAreas";

export function PaymentForm({ data }: { data: IPaymentCampaignField }) {
  return (
    <>
      <div className="inputs">{data.inputs && renderInputs(data.inputs)}</div>
    </>
  );
}
