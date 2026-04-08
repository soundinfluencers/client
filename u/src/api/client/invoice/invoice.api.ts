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
  console.log(res, "res");
  return res.data.data.invoices;
};
export const getPdffileInvoiceHistory = async (invoiceId: string) => {
  const res = await $api.get(`/invoice/download`, {
    params: { invoiceId },
    responseType: "blob",
  });
  return res.data as Blob;
};


export const getInvoiceById = async (invoiceId: string) => {
  try {
    const res = await $api.get(`/invoice/${invoiceId}`);
    return res.data.data;
  } catch (error) {
    console.log(error, "get invoice by id error");
    throw error;
  }
};

export const patchInvoiceById = async (
    invoiceId: string,
    payload: {
      poNumber: string;
      company: string;
      address: string;
      country: string;
    },
) => {
  try {
    const res = await $api.patch(`/invoice/${invoiceId}`, payload);
    return res.data;
  } catch (error) {
    console.log(error, "patch invoice by id error");
    throw error;
  }
};