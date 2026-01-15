import type { IPaymentMethodField } from "../../../../types/influencer/form/invoice/payment-method.types";
import { renderInputs } from "../../renderFunctions/input-textAreas";

interface Props {
  data: IPaymentMethodField;
}

export function InvoiceDetails({ data }: Props) {
  return (
    <div className="inputs">
      {data.inputs && renderInputs(data.inputs)}
      {data.description && (
        <p className='description'>
          {data.description}
        </p>
      )}
    </div>
  );
};
