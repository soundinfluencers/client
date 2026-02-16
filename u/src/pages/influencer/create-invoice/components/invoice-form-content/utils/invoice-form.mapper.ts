import type { InvoiceCreateRequestDto } from "../types/invoice-form-inputs.types";
import type {
  InvoicePayload
} from "@/pages/influencer/create-invoice/components/invoice-form-content/validation/schema.ts";

const mapAmount = (data: InvoicePayload): number => {
  if (data.amountType === "other") {
    if (data.amount == null) throw new Error("Amount is required");
    return data.amount;
  }

  if (data.amount == null) throw new Error("Balance amount is missing");
  return data.amount;
};

export const requestDtoMapper = (
  data: InvoicePayload,
): InvoiceCreateRequestDto => {
  const base: InvoiceCreateRequestDto = {
    firstName: data.firstName,
    lastName: data.lastName,
    address: data.address,
    country: data.country,
    amount: mapAmount(data),
    company: data.company || undefined,
    vatNumber: data.vatNumber || undefined,
    selectedPaymentMethod: data.selectedPaymentMethod,
  };

  switch (data.selectedPaymentMethod) {
    case "ukBankTransfer":
      return {
        ...base,
        ukBankTransfer: {
          beneficiary: data.beneficiary,
          beneficiaryAddress: data.beneficiaryAddress,
          sortCode: data.sortCode,
          accountNumber: data.accountNumber,
        },
      };

    case "internationalBankTransfer":
      return {
        ...base,
        internationalBankTransfer: {
          beneficiary: data.beneficiary,
          beneficiaryAddress: data.beneficiaryAddress,
          iban: data.iban,
          bankName: data.bankName,
          bankCountry: data.bankCountry,
          bankAccountCurrency: data.bankAccountCurrency,
          swiftBicCode: data.swiftBicCode,
        },
      };

    case "paypal":
      return {
        ...base,
        paypal: {
          paypalEmail: data.paypalEmail,
        },
      };
  }
};
