import { useInfluenserProfileStore } from '@/store/influencer/account-settings/useInfluenserProfileStore';

import { Form } from '../../../../../../../components';
import { AccountDetailsFormContent } from './components/AccountDetailsFormContent';
import { getDefaultFormValues } from './utils/getDefaultFormValues';

import './_account-details-form.scss';
import { accountDetailsSchema } from './validation/account-details-schema';

export const AccountDetailsForm: React.FC = () => {
  const { profile } = useInfluenserProfileStore();

  return (
    <Form
      className="account-details-form"
      defaultValues={getDefaultFormValues(profile)}
      schema={accountDetailsSchema as any}
    >
      <AccountDetailsFormContent />
    </Form>
  );
};