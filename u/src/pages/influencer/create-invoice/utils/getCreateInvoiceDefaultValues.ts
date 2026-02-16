import type { TInvoiceDetailsApi } from "@/pages/influencer/invoice-details/types/invoice-details.types.ts";
import type { TPaymentDetailsResponseDto } from "@/pages/influencer/payment-details/types/payment-details.types.ts";
import type {
  TInvoicePaymentMethod,
} from "@/pages/influencer/create-invoice/components/payment-bar/types/payment-method.types.ts";
import type {
  InternationalForm,
  PaypalForm, UkForm,
} from "@/pages/influencer/create-invoice/components/invoice-form-content/types/invoice-form-inputs.types.ts";

type DefaultsByTab = {
  ukBankTransfer: UkForm;
  internationalBankTransfer: InternationalForm;
  paypal: PaypalForm;
};

export function getCreateInvoiceDefaultValues<TTab extends TInvoicePaymentMethod>(
  invoiceDetails: TInvoiceDetailsApi | undefined,
  paymentDetails: TPaymentDetailsResponseDto | undefined,
  tab: TTab,
  balance: number | undefined,
): DefaultsByTab[TTab] {
  const base = {
    firstName: invoiceDetails?.firstName ?? "",
    lastName: invoiceDetails?.lastName ?? "",
    address: invoiceDetails?.address ?? "",
    country: invoiceDetails?.country ?? "",
    company: invoiceDetails?.company || undefined,
    vatNumber: invoiceDetails?.vatNumber || undefined,
    amountType: "balance" as const,
    amount: balance ?? null,
  };

  switch (tab) {
    case "ukBankTransfer":
      return {
        ...base,
        selectedPaymentMethod: "ukBankTransfer",
        beneficiary: paymentDetails?.ukBankTransfer?.beneficiary ?? "",
        beneficiaryAddress: paymentDetails?.ukBankTransfer?.beneficiaryAddress ?? "",
        sortCode: paymentDetails?.ukBankTransfer?.sortCode ?? "",
        accountNumber: paymentDetails?.ukBankTransfer?.accountNumber ?? "",
      } as DefaultsByTab[TTab];

    case "internationalBankTransfer":
      return {
        ...base,
        selectedPaymentMethod: "internationalBankTransfer",
        beneficiary: paymentDetails?.internationalBankTransfer?.beneficiary ?? "",
        beneficiaryAddress: paymentDetails?.internationalBankTransfer?.beneficiaryAddress ?? "",
        iban: paymentDetails?.internationalBankTransfer?.iban ?? "",
        bankName: paymentDetails?.internationalBankTransfer?.bankName ?? "",
        bankCountry: paymentDetails?.internationalBankTransfer?.bankCountry ?? "",
        bankAccountCurrency: paymentDetails?.internationalBankTransfer?.bankAccountCurrency ?? "",
        swiftBicCode: paymentDetails?.internationalBankTransfer?.swiftBicCode ?? "",
      } as DefaultsByTab[TTab];

    case "paypal":
      return {
        ...base,
        selectedPaymentMethod: "paypal",
        paypalEmail: paymentDetails?.paypal?.paypalEmail ?? "",
      } as DefaultsByTab[TTab];
  }
}
