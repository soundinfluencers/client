import type {
  TPaymentDetailsFormValues, TPaymentDetailsResponseDto,
} from "@/pages/influencer/payment-details/types/payment-details.types.ts";
import type {
  TInvoicePaymentMethod
} from "@/pages/influencer/create-invoice/components/payment-bar/types/payment-method.types.ts";

export const getDefaultValuesPaymentDetailsForm = (data: TPaymentDetailsResponseDto | undefined, tab: TInvoicePaymentMethod): TPaymentDetailsFormValues => {
  switch (tab) {
    case "ukBankTransfer":
      return {
        selectedPaymentMethod: tab,
        beneficiary: data?.ukBankTransfer?.beneficiary ?? '',
        beneficiaryAddress: data?.ukBankTransfer?.beneficiaryAddress ?? '',
        sortCode: data?.ukBankTransfer?.sortCode ?? '',
        accountNumber: data?.ukBankTransfer?.accountNumber ?? '',
      };
    case "internationalBankTransfer":
      return {
        selectedPaymentMethod: tab,
        beneficiary: data?.internationalBankTransfer?.beneficiary ?? '',
        beneficiaryAddress: data?.internationalBankTransfer?.beneficiaryAddress ?? '',
        iban: data?.internationalBankTransfer?.iban ?? '',
        bankName: data?.internationalBankTransfer?.bankName ?? '',
        bankCountry: data?.internationalBankTransfer?.bankCountry ?? '',
        bankAccountCurrency: data?.internationalBankTransfer?.bankAccountCurrency ?? '',
        swiftBicCode: data?.internationalBankTransfer?.swiftBicCode ?? '',
      };
    case "paypal":
      return {
        selectedPaymentMethod: tab,
        paypalEmail: data?.paypal?.paypalEmail ?? '',
      };
    default: {
      // to let TS highlight if added a new method and forget to handle it
      const _exhaustive: never = tab;
      void _exhaustive;
      return {
        selectedPaymentMethod: tab,
      };
    }
  }
}