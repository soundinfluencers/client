import type React from "react"
import { useEffect } from 'react';
import { useAccountSetupStore } from "./store/useAccountSetupStore";
import { Form } from '../../../../components/form/form';
import { AccountSetupFormContent } from './components/account-setup-form-content/AccountSetupFormContent';

import { getDefaultValues } from "./utils/get-form-default-values";
import { normalizeAccountForForm } from "../../shared/utils/socialAccount.mapper";
import { normalizePlatform } from "./utils/normalize-social-media-name";
import type { TSocialAccountFormValues } from "./types/account-setup.types";
import type { TSocialAccounts } from "@/types/user/influencer.types";

import arrowLeft from '../../../../assets/icons/arrow-left.svg';

import './_account-setup-form.scss';
import { socialAccountFormSchema } from "./validation/socialAccount.schema";

// /*
//   TODO: Account setup flow - all ready (need minor fixes);
//         10) Add correct form validation and disable submit if not fill required fields?
//         12) Add optimization for AccountDetails component (memo, useCallback)?
// */

interface Props {
  platform: TSocialAccounts;
  account: TSocialAccountFormValues | undefined;
  onSave: (data: TSocialAccountFormValues) => Promise<void> | void;
  onRemove: () => Promise<void> | void;
}

export const AccountSetupForm: React.FC<Props> = ({ platform, account, onRemove, onSave }) => {
  const { onResetAccountForm } = useAccountSetupStore();
  const isEdit = Boolean(account);
  const normalizedAccount = account ? normalizeAccountForForm(account) : undefined;
  // const formKey = account?.accountId ? `edit:${account.accountId}` : `create:${platform}`;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="account-setup-form">
      <button onClick={() => onResetAccountForm()} className="account-setup-form__btn-back">
        <img src={arrowLeft} alt="Go back" />
      </button>
      <div className="account-setup-form__header">
        <h2 className="account-setup-form__title">{isEdit ? `Edit your ${normalizePlatform(platform)} Account Setup` : `${normalizePlatform(platform)} Account Setup`}</h2>
        {!isEdit && <p className="account-setup-form__subtitle">Add your page info and audience insights</p>}
      </div>

      <Form
        // key={formKey}
        className="account-setup-form__form"
        defaultValues={getDefaultValues(normalizedAccount)}
        schema={socialAccountFormSchema as any}
      >
        <AccountSetupFormContent
          platform={platform}
          onRemove={onRemove}
          onSave={onSave}
          isEdit={isEdit}
        />
      </Form>
    </div>
  )
};