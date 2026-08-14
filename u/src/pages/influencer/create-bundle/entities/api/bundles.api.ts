import $api from "@/api/api.ts";
import type {
  IBundleAccount,
  ICreateBundleResponse,
  IGetBundleAccountResponse,
  ICreateBundleRequest,
} from '../model/bundles.types';

export const getBundleAccountsApi = async (): Promise<IBundleAccount[]> => {
  const { data } = await $api.get<IGetBundleAccountResponse>("/bundles/accounts");

  return data.data;
};

export const createBundleApi = async (body: ICreateBundleRequest): Promise<string> => {
  const response = await $api.post<ICreateBundleResponse>(
    '/bundles',
    body,
  );

  return response.data.data.bundleId;
};
