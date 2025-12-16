import './_user-inputs.scss';

import type React from 'react';
import { FormInput } from '../../../../../../../../components/ui/inputs/form-input/form-attributes';
import type { ISocialAccountMeta } from '../../../../../../../../constants/influencer/social-accounts.data';
import { Controller, type Control, type FieldErrors, type UseFormRegister, type UseFormSetValue } from 'react-hook-form';
import type { IAccountFormValues } from '../../../../../../../../types/user/influencer.types';
import { LogoUpload } from '../logo-upload/LogoUpload';

interface Props {
  meta: ISocialAccountMeta;
  register: UseFormRegister<IAccountFormValues>;
  control: Control<IAccountFormValues>;
  errors: FieldErrors<IAccountFormValues>;
}

export const UserInputs: React.FC<Props> = ({ meta, register, errors, control }) => {
  return (
    <div className="user-inputs">
      <FormInput
        name={'username'}
        label={`${meta.label} account name`}
        placeholder={`Enter ${meta.id} account name`}
        required
        register={register}
        error={errors.username}
      />
      <FormInput
        name={'link'}
        label={`${meta.label} link`}
        placeholder={`Enter ${meta.id} link`}
        required
        register={register}
        error={errors.link}
      />
      <FormInput
        name='followersNumber'
        label='Followers number'
        placeholder='Enter followers number'
        required
        register={register}
        error={errors.followersNumber}
      />
      <Controller
        name='logo'
        control={control}
        render={({ field, fieldState }) => (
          <LogoUpload
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error}
          />
        )}
      />
    </div>
  );
};

