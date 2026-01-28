import type { InvoiceCreateRequestDto } from "@/pages/influencer/create-invoice/components/invoice-form-content/types/invoice-form-inputs.types";
import $api from "../../api";

export const createInvoice = async (data: InvoiceCreateRequestDto): Promise<void> => {
  try {
    console.log("Payload to send:", data);

    await $api.post(`/invoice`, data);

    console.log("Invoice created successfully");
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw error;
  }
};