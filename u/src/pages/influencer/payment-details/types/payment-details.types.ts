import type {
  TInvoicePaymentMethod
} from "@/pages/influencer/create-invoice/components/payment-bar/types/payment-method.types.ts";

export type TPaymentDetailsFormValues = {
  // common
  selectedPaymentMethod: TInvoicePaymentMethod;

  // uk bank transfer fields
  beneficiary?: string;
  beneficiaryAddress?: string;
  sortCode?: string;
  accountNumber?: string;

  // international bank transfer fields
  iban?: string;
  bankName?: string;
  bankCountry?: string;
  bankAccountCurrency?: string;
  swiftBicCode?: string;

  // PayPal fields
  paypalEmail?: string;
}

export type TPaymentDetailsRequestDto = {
  selectedPaymentMethod: TInvoicePaymentMethod;

  ukBankTransfer?: {
    beneficiary: string;
    beneficiaryAddress: string;
    sortCode: string;
    accountNumber: string;
  };

  internationalBankTransfer?: {
    beneficiary: string;
    beneficiaryAddress: string;
    iban: string;
    bankName: string;
    bankCountry: string;
    bankAccountCurrency: string;
    swiftBicCode: string;
  };

  paypal?: {
    paypalEmail: string;
  };
};

export type TPaymentDetailsResponseDto = Omit<TPaymentDetailsRequestDto, 'selectedPaymentMethod'>;