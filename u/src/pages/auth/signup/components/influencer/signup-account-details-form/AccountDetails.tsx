import type React from "react"
import type { SocialMediaType } from "../../../../../../types/utils/constants.types";
import { useSignupInfluencerStore } from "../../../../../../store/features/signupInfluencer";
import { getSocialMeta } from "../../../../../../constants/influencer/social-accounts.data";
import { useForm } from "react-hook-form";
import { Form } from "./components/form/Form";
import { UserInputs } from "./components/user-inputs/UserInputs";
import { AccountSwitcher } from "./components/account-type-switcher/AccountSwitcher";
import { MusicGeners } from "./components/music-geners/MusicGeners";
import { ThemeTopics } from "./components/theme-topics/ThemeTopics";
import { AudienceInsights } from "./components/audience-insights/AudienceInsights";

import './_account-details.scss';
import type { IAccountFormValues } from "../../../../../../types/user/influencer.types";

interface Props {
  platform: SocialMediaType;
  mode: 'create' | 'edit';
  accountId?: string;
  goBack: () => void;
}

//TODO: useMemo for meta/existing

export const AccountDetails: React.FC<Props> = ({ platform, mode, accountId, goBack }) => {
  const { saveAccount, removeAccount, accounts } = useSignupInfluencerStore();

  const meta = getSocialMeta(platform);
  const existing = mode === 'edit' ? accounts.find(a => a.clientId === accountId) : null;

  const handleRemove = () => {
    if (accountId) {
      removeAccount(accountId);
    }
  }
  const form = useForm<IAccountFormValues>({
    defaultValues: existing ?
      {
        username: existing.username,
        link: existing.link,
        followersNumber: Number(existing.followersNumber),
        profileCategory: existing.profileCategory,
        logo: existing.logo instanceof File ? existing.logo : null,
      } : {
        profileCategory: 'community',
        logo: null,
      },
  });

  const { handleSubmit, register, control, formState: { errors, isSubmitting } } = form;

  const onSubmit = (data: IAccountFormValues) => {
    // await new Promise(res => setTimeout(res, 500));
    saveAccount({
      clientId: existing?.clientId ?? crypto.randomUUID(),
      platform,
      username: data.username,
      link: data.link,
      followersNumber: String(data.followersNumber),
      profileCategory: data.profileCategory,
      price: data.price,
      logo: data.logo ?? undefined,
    })
  };

  return (
    <div className="account-details">
      <button onClick={() => goBack()} className="btn-back">🡄</button>
      <button onClick={handleRemove} className="btn-save">-</button>
      <div className="account-details__header">
        <h2 className="account-details__title">{mode === 'edit' ? `Edit your ${meta?.label} Account Setup` : `${meta?.label} Account Setup`}</h2>
        {mode !== 'edit' && <p className="account-details__subtitle">Add your page info and audience insights</p>}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={{ width: 600 }}>
        <UserInputs
          meta={meta!!}
          register={register}
          control={control}
          errors={errors}
        />

        <AccountSwitcher control={control}/>

        <MusicGeners />

        <ThemeTopics />

        <AudienceInsights />

        <div>
          <span>Input Price</span>
        </div>

        <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Submit'}</button>
      </form>

    </div>
  )
};
