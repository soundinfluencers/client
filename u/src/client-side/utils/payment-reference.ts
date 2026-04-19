import type { PaymentMethodId } from "@/client-side/pages/payment-campaign/PaymentCampaign";

const PAYMENT_PREFIX_MAP: Record<PaymentMethodId, string> = {
    bank_card: "BC",
    paypal: "PP",
    bank_transfer_uk: "BT",
    bank_transfer_eu: "BT",
    bank_transfer_international: "BT",
};

export const getPaymentReferencePrefix = (method: PaymentMethodId): string => {
    return PAYMENT_PREFIX_MAP[method] ?? "PM";
};

export const generatePaymentReferenceNumber = (method: PaymentMethodId): string => {
    const prefix = getPaymentReferencePrefix(method);

    const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
    const timePart = Date.now().toString().slice(-6);

    return `${prefix}${timePart}${randomPart}`;
};