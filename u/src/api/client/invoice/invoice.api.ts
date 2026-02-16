import $api from "@/api/api";

export const getInvoiceDetails = async () => {
  try {
    const res = await $api.get("/profile/invoice-details");
    return res.data.data;
  } catch (error) {
    console.log(error, "err");
    throw error;
  }
};

export const updateInvoceDetails = async (InvoiceDetails: any) => {
  const response = await $api.patch("/profile/invoice-details", InvoiceDetails);

  return response.data;
};

export const getInvoiceHistory = async (limit: number, page: number) => {
  const res = await $api.get<any>("/invoice", {
    params: { limit, page },
  });
  return res.data.data.invoices;
};
