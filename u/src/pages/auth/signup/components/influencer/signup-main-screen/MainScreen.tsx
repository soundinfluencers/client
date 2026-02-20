import { useEffect, useState } from "react";
import {
  useInfluencerSignupStore,
} from "@/store/influencer/account-settings/useInfluenserSignupStore.ts";
import { TextInput } from "@components/ui/inputs/text-input/TextInput.tsx";
import { InputPhone } from "../../ui/phone-input/InputPhone";
import { SocialAccountsList } from "@/pages/influencer/components/social-accounts-list/SocialAccountsList.tsx";
import { ButtonMain } from "@components/ui/buttons-fix/ButtonFix.tsx";
import type { TSocialAccounts } from "@/types/user/influencer.types";
import { influencerSignupApi } from "@/api/auth/auth.api";

import './_main-screen.scss';
import { SignupInfluencerSuccess } from "../signup-influencer-success/SignupInfluencerSuccess";
import { signupAccountsForList } from "./utils/signupAccountForList.mapper";

export const MainScreen = () => {
  const {
    user,
    errors,
    validate,
    setField,
    resetSignup,
    // isFormReady,
    // submitError,
    accountsError,
    setSubmitError,
    validateAccounts
  } = useInfluencerSignupStore();
  const [isPhoneDropdownOpen, setIsPhoneDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSignup = async () => {
    if (isLoading) return;

    setSubmitError(null);

    const isValid = validate();
    const hasAccounts = validateAccounts();

    if (!isValid || !hasAccounts) return;

    setIsLoading(true);
    try {
      console.log(user);
      await influencerSignupApi(user);
      setIsSuccess(true);
      resetSignup();
    } catch (e: any) {
      setSubmitError(e?.response?.data?.message ?? "Server error");
    } finally {
      setIsLoading(false);
    }
  };

  // const isDisabled = !isFormReady() || isLoading;

  if (isSuccess) {
    return (
      <SignupInfluencerSuccess />
    );
  }

  // console.log(errors.phone)
  // console.log(accountsError)

  return (
    <div className="signup-influencer">
      <div className="signup-influencer__header">
        <p className="signup-influencer__title">Complete your application</p>
        <p className="signup-influencer__subtitle">Get approved to join the SoundInfluencers network</p>
      </div>

      <div>
        <p className="signup-influencer__inputs-label">Add Your Personal Details</p>
        <div className="signup-influencer__inputs">
          <TextInput
            title="First name*"
            placeholder="Enter first name"
            value={user.firstName}
            setValue={(v) => setField('firstName', v.trim())}
            isError={Boolean(errors.firstName)}
            errorMessage={errors.firstName ?? ''}
          />
          <TextInput
            title="Last name*"
            placeholder="Enter last name"
            value={user.lastName}
            setValue={(v) => setField('lastName', v.trim())}
            isError={Boolean(errors.lastName)}
            errorMessage={errors.lastName ?? ''}
          />
          <TextInput
            title="Email*"
            type="email"
            placeholder="Enter email"
            value={user.email}
            setValue={(v) => setField('email', v.trim())}
            isError={Boolean(errors.email)}
            errorMessage={errors.email ?? ''}
          />
          <InputPhone
            value={user.phone}
            setValue={(v) => setField('phone', v.trim())}
            isMenuOpen={isPhoneDropdownOpen}
            setIsMenuOpen={setIsPhoneDropdownOpen}
            isError={Boolean(errors.phone)}
            errorMessage={errors.phone ?? ''}
          />
          <TextInput
            title="Password*"
            type="password"
            value={user.password}
            placeholder="Enter password"
            setValue={(v) => setField('password', v)}
            isError={Boolean(errors.password)}
            errorMessage={errors.password ?? ''}
          />
        </div>
      </div>

      <div className="signup-influencer__socials">
        <div className="signup-influencer__socials-header">
          <p className="signup-influencer__socials-title">Connect your social accounts</p>
          <p className="signup-influencer__socials-subtitle">Add at least one platform to submit your application</p>
        </div>

        {!!accountsError && (
          <div className="signup-influencer__error">
            {accountsError}
          </div>
        )}

        <SocialAccountsList
          getAccounts={(platform: TSocialAccounts) => signupAccountsForList(platform, user)}
        />
      </div>

      <div className="signup-influencer__controls">
        <ButtonMain
          label={isLoading ? "Submitting..." : "Submit Application"}
          onClick={handleSignup}
        />

        <span>
          By clicking Submit Application, you confirm and approve the rates listed above and agree to our{'\n'}
          <a
           href="/terms/influencer"
           target="_blank"
           rel="noopener noreferrer"
           style={{ textDecoration: "underline", color: "black" }}
          >
           Terms & Conditions.
          </a>
        </span>
      </div>
    </div>
  );
};