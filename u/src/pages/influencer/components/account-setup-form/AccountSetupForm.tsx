import React from "react"
import { useEffect } from 'react';
import { useAccountSetupStore } from "./store/useAccountSetupStore";
import { Form } from '@/components';
import { AccountSetupFormContent } from './components/account-setup-form-content/AccountSetupFormContent';

import { getDefaultValues } from "./utils/get-form-default-values";
import { normalizePlatform } from "./utils/normalize-social-media-name";
import type { TSocialAccountFormValues } from "./types/account-setup.types";
import type { TSocialAccounts } from "@/types/user/influencer.types";

import arrowLeft from '../../../../assets/icons/arrow-left.svg';

import './_account-setup-form.scss';
import {
  getAccountSchemaForPlatform,
  // makeSocialAccountSchema,
  // socialAccountBaseSchema,
} from "@/pages/influencer/components/account-setup-form/validation/socialAccount.schema.ts";


// /*
//   TODO: Account setup flow - all ready (need minor fixes);
//         12) Add optimization for component (memo, useCallback)?
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
  // console.log('Account for form: ',account);
  // const formKey = account?.accountId ? `edit:${account.accountId}` : `create:${platform}`;

  const formKey = account?.accountId
    ? `edit:${account.accountId}`
    : `create:${platform}`;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  console.log(account);

  return (
    <div className="account-setup-form">
      <button
        className={`account-setup-form__back-button ${isEdit ? 'account-setup-form__back-button--edit' : ''}`}
        onClick={() => onResetAccountForm()}
        type="button"
      >
        <img src={arrowLeft} alt="Go back" />
      </button>
      <div className={`account-setup-form__header ${isEdit ? 'account-setup-form__header--edit' : ''}`}>
        <h2 className={`account-setup-form__title`}>{isEdit ? `Edit your ${normalizePlatform(platform)} Account Setup` : `${normalizePlatform(platform)} Account Setup`}</h2>
        {!isEdit && <p className="account-setup-form__subtitle">Add your page info and audience insights</p>}
      </div>

      <Form<TSocialAccountFormValues>
        key={formKey}
        className="account-setup-form__form"
        defaultValues={getDefaultValues(account)}
        schema={getAccountSchemaForPlatform(platform)}
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