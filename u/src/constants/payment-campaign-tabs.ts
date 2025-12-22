import BankCardIcon from "../assets/payments-icons/BankCard.svg";
import PayPalIcon from "../assets/payments-icons/PayPal.svg";
import BankTransferIcon from "../assets/payments-icons/BankTransfer.svg";
import CryptoIcon from "../assets/payments-icons/CryptoPayment.svg";
import { BankCard } from "../pages/client/payment-campaign/components/confirmations/bank-card";
import { BankTransfer } from "../pages/client/payment-campaign/components/confirmations/bank-transfer";
import { PayPal } from "../pages/client/payment-campaign/components/confirmations/paypal";

export const PAYMENT_CAMPAIGN_TABS = [
  {
    id: "BankCard",
    label: "Bank Card",
    icon: BankCardIcon,
    component: BankCard,
  },
  { id: "PayPal", label: "PayPal", icon: PayPalIcon, component: PayPal },
  {
    id: "BankTransfer",
    label: "Bank Transfer",
    icon: BankTransferIcon,
    component: BankTransfer,
  },
  // {
  //   id: "Crypto",
  //   label: "Crypto Payment",
  //   icon: CryptoIcon,
  //   component: CryptoPayment,
  // },
];
