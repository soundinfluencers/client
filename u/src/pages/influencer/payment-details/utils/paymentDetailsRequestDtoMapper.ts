import type {
  TPaymentDetailsFormValues, TPaymentDetailsRequestDto,
} from "@/pages/influencer/payment-details/types/payment-details.types.ts";

export const requestDtoMapper = (
  data: TPaymentDetailsFormValues,
): TPaymentDetailsRequestDto => {
  const basePaymentMethod = data.selectedPaymentMethod;

  switch (data.selectedPaymentMethod) {
    case "ukBankTransfer":
      return {
        selectedPaymentMethod: basePaymentMethod,
        ukBankTransfer: {
          beneficiary: data.beneficiary ?? '',
          beneficiaryAddress: data.beneficiaryAddress ?? '',
          sortCode: data.sortCode ?? '',
          accountNumber: data.accountNumber ?? '',
        },
      };

    case "internationalBankTransfer":
      return {
        selectedPaymentMethod: basePaymentMethod,
        internationalBankTransfer: {
          beneficiary: data.beneficiary ?? '',
          beneficiaryAddress: data.beneficiaryAddress ?? '',
          iban: data.iban ?? '',
          bankName: data.bankName ?? '',
          bankCountry: data.bankCountry ?? '',
          bankAccountCurrency: data.bankAccountCurrency ?? '',
          swiftBicCode: data.swiftBicCode ?? '',
        },
      };

    case "paypal":
      return {
        selectedPaymentMethod: basePaymentMethod,
        paypal: {
          paypalEmail: data.paypalEmail ?? '',
        },
      };

    default: {
      // to let TS highlight if added a new method and forget to handle it
      const _exhaustive: never = data.selectedPaymentMethod;
      void _exhaustive;
      return { selectedPaymentMethod: basePaymentMethod };
    }
  }
};