import type React from "react"
import type { SocialMediaType } from "../../../../../../types/utils/constants.types";
import { useSignupInfluencerStore } from "../../../../../../store/features/signupInfluencer";
import { getSocialMeta } from "../../../../../../constants/influencer/social-accounts.data";
import { useForm, useWatch } from "react-hook-form";
import { UserInputs } from "./components/user-inputs/UserInputs";
import { AccountSwitcher } from "./components/account-type-switcher/AccountSwitcher";
import { ENTERTAINMENT_CATEGORIES_DATA, MUSIC_CATEGORIES_DATA, MUSIC_GENERS_DATA, THEME_TOPICS_DATA } from "../../../../../../constants/influencer/checkbox-button.data";

import './_account-details.scss';
import type { IAccountFormValues } from "../../../../../../types/user/influencer.types";
import { useEffect } from "react";
import { CheckboxButtonList } from "./components/checkbox-button-list/CheckboxButtonList";
import { AudienceInsights } from "./components/audience-insights/AudienceInsights";
// import { FormInput } from "../../../../../../components/ui/inputs/form-input/form-attributes";
import { ButtonMain, ButtonSecondary } from "../../../../../../components/ui/buttons/button/Button";
import arrowLeft from '../../../../../../assets/icons/arrow-left.svg';
import { PLATFORM_CONFIG } from "../../../../../../constants/influencer/platform-config";

interface Props {
  platform: SocialMediaType;
  mode: 'create' | 'edit';
  accountId?: string;
  goBack: () => void;
}

/*
  TODO: 1) set fake load? await new Promise(res => setTimeout(res, 500));
        2) scroll to top on mount?
        8) Fix edit mode for all inputs/checkboxes
        10) Add form validation and disable submit if not fill required fields
        11) Add modal for delete account confirmation (base delete button open modal)
        12) Add optimization for AccountDetails component (memo, useCallback)
        13) Change actions buttons styles

        3) Render accountSwitcher and CheckboxButtonList based on current profileCategory and platform✅
        14) Implement button to go back to previous step✅
        7) Add dropdown for country selection✅
        4) Fix audience insights inputs width✅
        5) Fix percentage input for editing (replace simbol %) ✅
        6) Add simbol for price input (based on currency) ✅
        9) Make adaptive for tablet/mobile ✅
*/

export const AccountDetails: React.FC<Props> = ({ platform, mode, accountId, goBack }) => {
  const { saveAccount, removeAccount, accounts } = useSignupInfluencerStore();

  const meta = getSocialMeta(platform);
  const existing = mode === 'edit' ? accounts.find(a => a.clientId === accountId) : null;
  const platformConfig = PLATFORM_CONFIG[platform];

  const handleRemove = () => {
    if (accountId) {
      removeAccount(accountId);
    }
  };

  const onSubmit = (data: IAccountFormValues) => {
    saveAccount({
      clientId: existing?.clientId ?? crypto.randomUUID(),
      platform,
      username: data.username,
      link: data.link,
      followersNumber: String(data.followersNumber),
      profileCategory: data.profileCategory,
      musicStyle: data.musicStyle,
      musicSubStyles: data.musicSubStyles,
      musicStyleOther: data.musicStyleOther,
      countries: data.countries?.filter(c => c.country && c.percentage != null),
      price: data.price,
      logo: data.logo ?? undefined,
    })
  };

  const form = useForm<IAccountFormValues>({
    defaultValues: existing ?
      {
        username: existing.username,
        link: existing.link,
        followersNumber: Number(existing.followersNumber),
        profileCategory: existing.profileCategory,
        logo: existing.logo instanceof File ? existing.logo : null,
        // countries: existing.countries ?? [],
        price: existing.price?.toString(),
        musicStyle: existing.musicStyle,
        musicSubStyles: existing.musicSubStyles,
        musicStyleOther: existing.musicStyleOther,
      } : {
        profileCategory: 'community',
        logo: null,
        countries: [],
      },
  });

  const { handleSubmit, register, control, formState: { errors }, resetField, setValue } = form;
  // const methods = useForm<IAccountFormValues>();

  const profileCategory = useWatch({
    control,
    name: 'profileCategory',
  });

  useEffect(() => {
    // Reset fields when profileCategory changes
    if (profileCategory === 'community') {
      resetField('musicStyle');
      resetField('musicSubStyles');
      resetField('musicStyleOther');
    } else if (profileCategory === 'creator') {
      resetField('entertainmentCategories');
      resetField('musicCategories');
    }
  }, [profileCategory, resetField]);

  return (
    <div className="account-details">
      <button onClick={() => goBack()} className="account-details__btn-back">
        <img src={arrowLeft} alt="Go back" />
      </button>
      <div className="account-details__header">
        <h2 className="account-details__title">{mode === 'edit' ? `Edit your ${meta?.label} Account Setup` : `${meta?.label} Account Setup`}</h2>
        {mode !== 'edit' && <p className="account-details__subtitle">Add your page info and audience insights</p>}
      </div>

      <form className="account-details__form">
        <UserInputs
          meta={meta!!}
          register={register}
          control={control}
          errors={errors}
        />

        {platformConfig.switcher && (
          <AccountSwitcher control={control} />
        )}

        {profileCategory === 'community' && (
          <>
            {platformConfig.musicGenres && (
              <CheckboxButtonList
                data={MUSIC_GENERS_DATA}
                title="Music genres"
                subtitle="Select all the applicable"
                control={control}
                nameParent="musicStyle"
                nameChildren="musicSubStyles"
              />
            )}

            {platformConfig.themeTopics && (
              <CheckboxButtonList
                data={THEME_TOPICS_DATA}
                title="Theme topics"
                subtitle="Select this if the main core theme of the page (optional)"
                control={control}
                nameParent="musicStyleOther"
              />
            )}
          </>
        )}

        {profileCategory === 'creator' && (
          <>
            <CheckboxButtonList
              data={ENTERTAINMENT_CATEGORIES_DATA}
              title="Entertainment categories"
              subtitle="Select all the applicable"
              control={control}
              nameParent="entertainmentCategories"
            />
            <CheckboxButtonList
              data={MUSIC_CATEGORIES_DATA}
              title="Music categories"
              subtitle="Select all the applicable"
              control={control}
              nameParent="musicCategories"
            />
          </>
        )}

        {platformConfig.audienceInsights && (
          <AudienceInsights register={register} setValue={setValue} />
        )}

        <div className="account-details__price-input">
          <label htmlFor="price">
            Price for 1 Instagram post & story, include your currency
          </label>
          <input
            id="price"
            type="numeric"
            placeholder="100€"
            {...register('price', {
              setValueAs: (value: string) => {
                if (!value) return null;
                return Number(value.replace('€', ''));
              },
              onChange: (e) => {
                const val = e.target.value.replace('€', '');
                if (!/^\d*\.?\d*$/.test(val)) return;
                e.target.value = val ? `${val}€` : '';
              }
            })}
          />
        </div>

        <div className="account-details__actions">
          {mode === 'edit' ? (
            <>
              <ButtonSecondary
                className="account-details__btn"
                onClick={() => handleRemove()}
                text="Delete account"
              />
              <ButtonMain
                onClick={() => onSubmit(form.getValues())}
                text="Save"
                className="account-details__btn"
              />
            </>
          ) : (
            <ButtonMain
              text={'Add account'}
              onClick={() => handleSubmit(onSubmit)()}
              className="account-details__btn submit"
            />
          )}
        </div>
      </form>
    </div>
  )
};