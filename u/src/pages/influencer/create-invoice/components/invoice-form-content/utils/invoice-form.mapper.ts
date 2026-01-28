import type { InvoiceCreateRequestDto, InvoiceFormValues } from "../types/invoice-form-inputs.types";

const required = <T>(value: T | undefined, fieldName: string): T => {
  if (value === undefined || value === null || (value as unknown) === "") {
    throw new Error(`Missing required field: ${fieldName}`);
  }
  return value;
};

export const requestDtoMapper = (
  data: InvoiceFormValues,
): InvoiceCreateRequestDto => {
  const base: InvoiceCreateRequestDto = {
    firstName: data.firstName,
    lastName: data.lastName,
    address: data.address,
    country: data.country,
    amount: data.amount,
    company: data.company || undefined,
    vatNumber: data.vatNumber || undefined,
    selectedPaymentMethod: data.selectedPaymentMethod,
  };

  switch (data.selectedPaymentMethod) {
    case "ukBankTransfer":
      return {
        ...base,
        ukBankTransfer: {
          beneficiary: required(data.beneficiary, "beneficiary"),
          beneficiaryAddress: required(
            data.beneficiaryAddress,
            "beneficiaryAddress",
          ),
          sortCode: required(data.sortCode, "sortCode"),
          accountNumber: required(data.accountNumber, "accountNumber"),
        },
      };

    case "internationalBankTransfer":
      return {
        ...base,
        internationalBankTransfer: {
          beneficiary: required(data.beneficiary, "beneficiary"),
          beneficiaryAddress: required(
            data.beneficiaryAddress,
            "beneficiaryAddress",
          ),
          iban: required(data.iban, "iban"),
          bankName: required(data.bankName, "bankName"),
          bankCountry: required(data.bankCountry, "bankCountry"),
          bankAccountCurrency: required(
            data.bankAccountCurrency,
            "bankAccountCurrency",
          ),
          swiftBicCode: required(data.swiftBicCode, "swiftBicCode"),
        },
      };

    case "paypal":
      return {
        ...base,
        paypal: {
          paypalEmail: required(data.paypalEmail, "paypalEmail"),
        },
      };

    default: {
      // to let TS highlight if added a new method and forget to handle it
      const _exhaustive: never = data.selectedPaymentMethod;
      void _exhaustive;
      return base;
    }
  }
};
