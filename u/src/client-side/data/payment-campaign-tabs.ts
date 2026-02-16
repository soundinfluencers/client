import BankCardIcon from "@/assets/payments-icons/BankCard.svg";
import PayPalIcon from "@/assets/payments-icons/PayPal.svg";
import BankTransferIcon from "@/assets/payments-icons/BankTransfer.svg";
import { BankCard, BankTransfer, PayPal } from "../widgets";

export type PaymentTabId = "bank_card" | "paypal" | "bank_transfer";
export type PaymentTab = {
  id: PaymentTabId;
  label: string;
  icon: string;
  component: React.FC<any>;
};

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
