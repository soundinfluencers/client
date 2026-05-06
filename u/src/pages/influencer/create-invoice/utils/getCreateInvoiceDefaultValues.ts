import type {
  TInvoicePaymentMethod,
} from "@/pages/influencer/create-invoice/components/payment-bar/types/payment-method.types.ts";
import type {
  InternationalForm, InvoiceCreateRequestDto,
  PaypalForm, UkForm,
} from "@/pages/influencer/create-invoice/components/invoice-form-content/types/invoice-form-inputs.types.ts";

type DefaultsByTab = {
  ukBankTransfer: UkForm;
  internationalBankTransfer: InternationalForm;
  paypal: PaypalForm;
};

export function getCreateInvoiceDefaultValues<TTab extends TInvoicePaymentMethod>(
    data: InvoiceCreateRequestDto,
    tab: TTab,
    balance: number | undefined,
): DefaultsByTab[TTab] {
  const base = {
    firstName: data?.firstName ?? "",
    lastName: data?.lastName ?? "",
    address: data?.address ?? "",
    country: data?.country ?? "",
    company: data?.company || undefined,
    vatNumber: data?.vatNumber || undefined,
    amountType: "balance" as const,
    amount: balance ?? null,
  };

  switch (tab) {
    case "ukBankTransfer":
      return {
        ...base,
        selectedPaymentMethod: "ukBankTransfer",
        beneficiary: data?.ukBankTransfer?.beneficiary ?? "",
        beneficiaryAddress: data?.ukBankTransfer?.beneficiaryAddress ?? "",
        sortCode: data?.ukBankTransfer?.sortCode ?? "",
        accountNumber: data?.ukBankTransfer?.accountNumber ?? "",
      } as DefaultsByTab[TTab];

    case "internationalBankTransfer":
      return {
        ...base,
        selectedPaymentMethod: "internationalBankTransfer",
        beneficiary: data?.internationalBankTransfer?.beneficiary ?? "",
        beneficiaryAddress: data?.internationalBankTransfer?.beneficiaryAddress ?? "",
        iban: data?.internationalBankTransfer?.iban ?? "",
        bankName: data?.internationalBankTransfer?.bankName ?? "",
        bankCountry: data?.internationalBankTransfer?.bankCountry ?? "",
        bankAccountCurrency: data?.internationalBankTransfer?.bankAccountCurrency ?? "",
        swiftBicCode: data?.internationalBankTransfer?.swiftBicCode ?? "",
      } as DefaultsByTab[TTab];

    case "paypal":
      return {
        ...base,
        selectedPaymentMethod: "paypal",
        paypalEmail: data?.paypal?.paypalEmail ?? "",
      } as DefaultsByTab[TTab];
  }
}