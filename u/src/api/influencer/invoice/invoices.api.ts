import $api from "../../api";
import type { IInvoiceResponseModel } from "@/pages/influencer/invoices-details/types/invoice";

export const getInfluencerInvoices = async (
  limit: number,
  page: number,
): Promise<IInvoiceResponseModel[]> => {
  try {
    const response = await $api.get(`/invoice?limit=${limit}&page=${page}`);
    console.log(response);
    // throw new Error("Not implemented");
    return response.data.data.invoices;
  } catch (error) {
    console.error("Error fetching influencer invoices:", error);
    throw error;
  }
};
