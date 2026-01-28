import type { TInvoicePaymentMethod } from "../../payment-bar/types/payment-method.types";

export type TInvoiceInputConfig = {
  type: "text" | "number" | "email";
  label: string;
  name: string;
  placeholder: string;
  description?: string;
};

export interface IPaymentMethodField {
  inputs: TInvoiceInputConfig[];
}

export type InvoiceFormValues = {
  // invoice details
  firstName: string;
  lastName: string;
  address: string;
  country: string;

  company?: string;
  vatNumber?: string;

  // common
  selectedPaymentMethod: TInvoicePaymentMethod;
  amount: number;

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

  // paypal fields
  paypalEmail?: string;
};

export type InvoiceCreateRequestDto = {
  firstName: string;
  lastName: string;
  address: string;
  country: string;
  amount: number;

  company?: string;
  vatNumber?: string;

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
