

import { BundleAccountList } from "./bundle-account-list/bundle-account-list";
import { BundleTotalPrice } from "./bundle-total-price/bundle-total-price";

import s from './bundle-builder.module.scss';
import type { IBundleAccount } from "@/pages/influencer/create-bundle/entities";
import { CreateBundleForm, type TBundleFormValues } from "@/pages/influencer/create-bundle/features/create-bundle";

interface BundleBuilderProps {
  accounts: IBundleAccount[];
  selectedAccountIds: string[];
  totalPrice: number;
  isSubmitting: boolean;
  isSubmitDisabled: boolean;
  onToggleAccount: (accountId: string) => void;
  onSubmit: (values: TBundleFormValues) => Promise<void> | void;
}

export const BundleBuilder = ({
  accounts,
  selectedAccountIds,
  totalPrice,
  isSubmitting,
  isSubmitDisabled,
  onToggleAccount,
  onSubmit,
}: BundleBuilderProps) => {
  return (
    <div className={s.content}>
      <BundleAccountList
        accounts={accounts}
        selectedAccountIds={selectedAccountIds}
        onToggleAccount={onToggleAccount}
      />

      <BundleTotalPrice value={totalPrice}/>

      <CreateBundleForm
        onHandleSubmit={onSubmit}
        isSubmitting={isSubmitting}
        isSubmitDisabled={isSubmitDisabled}
      />
    </div>
  );
};
