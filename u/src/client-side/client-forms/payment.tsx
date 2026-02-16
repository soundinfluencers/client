import { renderInputs } from "@/shared/ui/form/renderFunctions/input-textAreas";
import type { IPaymentCampaignField } from "@/types/client/form-clients/payment-campaign-inputs";

export function PaymentForm({ data }: { data: IPaymentCampaignField }) {
  return (
    <>
      <div className="inputs">{data.inputs && renderInputs(data.inputs)}</div>
    </>
  );
}
