// import { useInfluencerProfileStore } from '@/store/influencer/account-settings/useInfluencerProfileStore.ts';

import { Form } from '@/components';
import { AccountDetailsFormContent } from './components/AccountDetailsFormContent';
import { getDefaultFormValues } from './utils/getDefaultFormValues';

import './_account-details-form.scss';
// import { accountDetailsSchema } from './validation/account-details-schema';
import React from "react";
import type { InfluencerProfileApi } from "@/types/user/influencer.types.ts";

interface Props {
  profile: InfluencerProfileApi | undefined;
}

export const AccountDetailsForm: React.FC<Props> = ({ profile }) => {
  // const { profile } = useInfluencerProfileStore();

  return (
    <Form
      className="account-details-form"
      defaultValues={getDefaultFormValues(profile)}
      schema={undefined}
    >
      <AccountDetailsFormContent profile={profile}/>
    </Form>
  );
};