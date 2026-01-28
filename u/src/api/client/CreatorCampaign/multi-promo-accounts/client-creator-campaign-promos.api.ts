import $api from "../../../api";
import type { MultiPromoAccountsBody } from "./types";

export const getMultiPromoAccounts = async ({
  sortBy = "bestMatch",
  limit = 100000000,
  page = 1,
  body,
}: {
  sortBy?: string;
  limit?: number;
  page?: number;
  body: MultiPromoAccountsBody;
}) => {
  const response = await $api.post(`/profile/social-account/filter`, body, {
    params: {
      sortBy,
      limit,
      page,
    },
  });
  console.log(response.data, "dadadadadd");
  return response.data;
};
