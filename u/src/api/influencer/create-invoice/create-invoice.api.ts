import type { InvoiceCreateRequestDto } from "@/pages/influencer/create-invoice/components/invoice-form-content/types/invoice-form-inputs.types";
import $api from "../../api";

export const createInvoice = async (
  data: InvoiceCreateRequestDto,
): Promise<void> => {
  try {
    console.log("Creating invoice with data:", data);
    await $api.post(`/invoice`, data);

    console.log("Invoice created successfully");
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw error;
  }
};

export const getInvoiceDraft = async (): Promise<InvoiceCreateRequestDto> => {
  console.log("Fetching invoice draft...");

  const { data } = await $api.get('/invoice/draft');

  console.log("Invoice draft fetched:", data.data);

  return data.data as InvoiceCreateRequestDto;
}