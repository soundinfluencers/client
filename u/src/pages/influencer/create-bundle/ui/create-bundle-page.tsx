import { useState } from "react";
import {
  useBundleAccountsQuery,
  type IBundleAccount,
  type ICreateBundleRequest,
  type TCreateBundleAccount,
} from "@/pages/influencer/create-bundle/entities";
import { PageBreadcrumbs } from "@/pages/influencer/create-bundle/widgets/page-breadcrumbs";
import { PageTitle } from "@/pages/influencer/create-bundle/widgets/page-title";
import { BundleBuilder } from "@/pages/influencer/create-bundle/widgets/bundle-builder";


import s from './create-bundle-page.module.scss';
import { Container } from "@/components";
import {
  type TBundleFormValues,
  useCreateBundleMutation,
} from "@/pages/influencer/create-bundle/features/create-bundle";

const mapAccountsToCreateDto = (accounts: IBundleAccount[]): TCreateBundleAccount[] => {
  return accounts.map((account) => ({
    accountId: account.accountId,
    socialMedia: account.socialMedia,
    username: account.username,
  }));
};

export const InfluencerCreateBundlePage = () => {
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const {
    mutateAsync: createBundle,
    isPending: isCreatingBundle,
  } = useCreateBundleMutation();

  const {
    data,
    isPending,
    isError,
  } = useBundleAccountsQuery();

  const totalPrice = data?.reduce((total, account) => {
    if (!selectedAccountIds.includes(account.accountId)) {
      return total;
    }

    return total + account.price;
  }, 0) ?? 0;

  const handleToggleAccount = (accountId: string) => {
    setSelectedAccountIds((currentIds) => {
      const isSelected = currentIds.includes(accountId);

      if (isSelected) {
        return currentIds.filter((id) => id !== accountId);
      }

      return [...currentIds, accountId];
    });
  };

  const handleSubmit = async (
    values: TBundleFormValues,
  ): Promise<void> => {
    if (!data || selectedAccountIds.length < 2) {
      return;
    }

    const selectedAccounts = data.filter((account) =>
      selectedAccountIds.includes(account.accountId)
    );

    const payload: ICreateBundleRequest = {
      accounts: mapAccountsToCreateDto(selectedAccounts),
      currency: values.currency,
      price: Number(values.price),
    };

    await createBundle(payload);

    setSelectedAccountIds([]);
  };

  return (
    <Container>
      <div className={s.page}>
        <PageBreadcrumbs
          items={[
            { label: "Dashboard", to: "/" },
            { label: "Bundle" },
          ]}
        />

        <div className={s.section}>
          <PageTitle
            title="Build your custom bundle"
            subtitle="Create a bundle by combining your accounts and offering a discounted package to clients."
            variants="protected"
            className={s.title}
          />

          {isPending && !data ? (
            <div>Loading...</div>
          ) : isError || !data ? (
            <div>Error while loading bundle accounts</div>
          ) : (
            <BundleBuilder
              accounts={data}
              selectedAccountIds={selectedAccountIds}
              totalPrice={totalPrice}
              isSubmitting={isCreatingBundle}
              isSubmitDisabled={selectedAccountIds.length < 2}
              onToggleAccount={handleToggleAccount}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </Container>
  );
};
