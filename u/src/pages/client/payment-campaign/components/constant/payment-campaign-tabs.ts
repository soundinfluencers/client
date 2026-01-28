import BankCardIcon from "@/assets/payments-icons/BankCard.svg";
import PayPalIcon from "@/assets/payments-icons/PayPal.svg";
import BankTransferIcon from "@/assets/payments-icons/BankTransfer.svg";
import { BankCard } from "@/pages/client/payment-campaign/components/confirmations/bank-card";
import { BankTransfer } from "@/pages/client/payment-campaign/components/confirmations/bank-transfer";
import { PayPal } from "@/pages/client/payment-campaign/components/confirmations/paypal";
import type { PaymentTab } from "../../types";

export const PAYMENT_CAMPAIGN_TABS: readonly PaymentTab[] = [
  {
    id: "bank_card",
    label: "Bank Card",
    icon: BankCardIcon,
    component: BankCard,
  },
  {
    id: "paypal",
    label: "PayPal",
    icon: PayPalIcon,
    component: PayPal,
  },
  {
    id: "bank_transfer",
    label: "Bank Transfer",
    icon: BankTransferIcon,
    component: BankTransfer,
  },
] as const;
