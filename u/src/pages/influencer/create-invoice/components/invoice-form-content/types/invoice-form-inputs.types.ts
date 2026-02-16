import type { TInvoicePaymentMethod } from "../../payment-bar/types/payment-method.types";

export type TInvoiceInputConfig = {
  type: "text" | "number" | "email" | 'country';
  label: string;
  name: string;
  placeholder: string;
  description?: string;
};

export interface IPaymentMethodField {
  inputs: TInvoiceInputConfig[];
}

export type InvoiceBase = {
  firstName: string;
  lastName: string;
  address: string;
  country: string;
  company?: string;
  vatNumber?: string;
  amountType: "balance" | "other";
  amount: number | null;
};

export type UkForm = InvoiceBase & {
  selectedPaymentMethod: "ukBankTransfer";
  beneficiary: string;
  beneficiaryAddress: string;
  sortCode: string;
  accountNumber: string;
};

export type InternationalForm = InvoiceBase & {
  selectedPaymentMethod: "internationalBankTransfer";
  beneficiary: string;
  beneficiaryAddress: string;
  iban: string;
  bankName: string;
  bankCountry: string;
  bankAccountCurrency: string;
  swiftBicCode: string;
};

export type PaypalForm = InvoiceBase & {
  selectedPaymentMethod: "paypal";
  paypalEmail: string;
};

export type InvoiceFormValues = UkForm | InternationalForm | PaypalForm;

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
