import { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useAccountSetupStore } from '../../store/useAccountSetupStore';

import { FormFields } from '../../../../../../components/form/render-fields/FormFields';
import { AccountSwitcher } from '../account-type-switcher/AccountSwitcher';
import { CheckboxButtonList } from '../checkbox-button-list/CheckboxButtonList';
import { AudienceInsights } from '../audience-insights/AudienceInsights';
import { PriceInput } from '../price-input/PriceInput';
import { ButtonMain, ButtonSecondary } from '../../../../../../components/ui/buttons-fix/ButtonFix';
import { Modal } from '../../../../../../components/ui/modal-fix/Modal';

import { PLATFORM_CONFIG } from '../../data/account-setup-form.data';
import { ACCOUNT_INPUTS_DATA } from './data/user-inputs.data';
import { MUSIC_GENERS_DATA } from '../checkbox-button-list/data/music-genres.data';
import { THEME_TOPICS_DATA } from '../checkbox-button-list/data/categories.data';
import { ENTERTAINMENT_CATEGORIES_DATA, MUSIC_CATEGORIES_DATA } from '../checkbox-button-list/data/creator-categories.data';

import type { TSocialAccounts } from '@/types/user/influencer.types';
import type { TSocialAccountFormValues } from '../../types/account-setup.types';

import './_account-setup-form-content.scss';
import { normalizeAccountForApi } from '@/pages/influencer/shared/utils/socialAccount.mapper';

interface Props {
  platform: TSocialAccounts;
  isEdit: boolean;
  onSave: (data: TSocialAccountFormValues) => Promise<void> | void;
  onRemove: () => Promise<void> | void;
};

//TODO: add loading state to buttons
export const AccountSetupFormContent = ({ platform, isEdit, onRemove, onSave }: Props) => {
  const { control, setValue, handleSubmit } = useFormContext<TSocialAccountFormValues>();
  const { onResetAccountForm } = useAccountSetupStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const platformConfig = PLATFORM_CONFIG[platform];

  const profileCategory = useWatch({
    control,
    name: 'profileCategory',
  });

  const isCommunity = profileCategory === 'community';
  const isCreator = profileCategory === 'creator';

  useEffect(() => {
    // сброс значений чекбоксов при смене типа профиля
    if (profileCategory === 'community') {
      setValue('creatorCategories', [], {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
    if (profileCategory === 'creator') {
      setValue('musicGenres', [], {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue('categories', [], {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [profileCategory, setValue]);

  const handleRemove = async () => {
    setIsLoading(true);

    try {
      await onRemove();
      onResetAccountForm();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (data: TSocialAccountFormValues) => {
    console.log("form data to save:", data);
    setIsLoading(true);
    try {
      const cleaned = normalizeAccountForApi(data);
      console.log("cleaned form data to save:", cleaned);
      await onSave(cleaned);
      onResetAccountForm();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="account-setup-form-content">
        <FormFields inputs={ACCOUNT_INPUTS_DATA[platform].inputs} />

        {platformConfig.switcher && <AccountSwitcher />}

        {isCommunity && (
          <>
            {platformConfig.musicGenres && (
              <CheckboxButtonList
                data={MUSIC_GENERS_DATA}
                title="Music genres"
                subtitle="Select all the applicable"
                name="musicGenres"
              />
            )}

            {platformConfig.themeTopics && (
              <CheckboxButtonList
                data={THEME_TOPICS_DATA}
                title="Theme topics"
                subtitle="Select this if the main core theme of the page (optional)"
                name="categories"
              />
            )}
          </>
        )}

        {isCreator && (
          <>
            <CheckboxButtonList
              data={ENTERTAINMENT_CATEGORIES_DATA}
              title="Entertainment categories"
              subtitle="Select all the applicable"
              name="creatorCategories"
            />
            <CheckboxButtonList
              data={MUSIC_CATEGORIES_DATA}
              title="Music categories"
              subtitle="Select all the applicable"
              name="creatorCategories"
            />
          </>
        )}

        {platformConfig.audienceInsights && (
          <AudienceInsights />
        )}

        <PriceInput platform={platform} />
      </div>

      <div className="account-setup-form-content__actions">
        {isEdit ? (
          <>
            <ButtonSecondary
              onClick={() => setIsModalOpen(true)}
              label="Delete account"
            />
            <ButtonMain
              onClick={handleSubmit(handleSave)}
              label="Save"
              type='submit'
            />
          </>
        ) : (
          <ButtonMain
            label={'Add account'}
            onClick={handleSubmit(handleSave)}
            type='submit'
          />
        )}
      </div>

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <div className='account-setup-form-content__modal'>
            <div className='account-setup-form-content__modal-header'>
              <h2 className='account-setup-form-content__modal-header-title'>Delete Account</h2>
              <p className='account-setup-form-content__modal-header-subtitle'>Are you sure you want to delete this account?</p>
            </div>

            <div className='account-setup-form-content__modal-actions'>
              <ButtonSecondary label='Cancel' onClick={() => setIsModalOpen(false)} />
              <ButtonMain label='Delete' onClick={handleRemove} />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};