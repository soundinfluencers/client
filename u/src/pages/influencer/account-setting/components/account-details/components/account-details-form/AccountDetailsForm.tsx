import './_account-details-form.scss';

import { Form } from '../../../../../../../components';
import { useUserStore } from '../../../../../../../store/influencer/account-settings/useUserStore';
import { AccountDetailsFormContent } from './components/AccountDetailsFormContent';
import { useAccountSettingsStore } from '../../../../store/useAccountSettingsStore';
import { getDefaultFormValues } from './utils/getDefaultFormValues';

export const AccountDetailsForm: React.FC = () => {
  const { user } = useUserStore();
  const {} = useAccountSettingsStore();

  return (
    <Form
      className="account-details-form"
      defaultValues={getDefaultFormValues(user)}
    >
      <AccountDetailsFormContent />
    </Form>
  );
};