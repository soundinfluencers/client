import { useCallback, useEffect, useRef, useState } from "react";
import {
  useInfluencerSignupStore,
} from "@/store/influencer/account-settings/useInfluenserSignupStore.ts";
import { SocialAccountsList } from "@/pages/influencer/components/social-accounts-list/SocialAccountsList.tsx";
import { ButtonMain } from "@components/ui/buttons-fix/ButtonFix.tsx";
import type { TSocialAccounts } from "@/types/user/influencer.types";
import { influencerSignupApi } from "@/api/auth/auth.api";

import './_main-screen.scss';
import { SignupInfluencerSuccess } from "../signup-influencer-success/SignupInfluencerSuccess";
import { signupAccountsForList } from "./utils/signupAccountForList.mapper";
import {
  SignupPersonalDetailsForm,
} from "@/pages/auth/signup/components/influencer/signup-personal-details-form/SignupPersonalDetailsForm.tsx";
import type { UseFormReturn } from "react-hook-form";
import type {
  PersonalDetailsValues,
} from "@/pages/auth/signup/components/influencer/signup-personal-details-form/types/personal-details-form.types.ts";

export const MainScreen = () => {
  console.count("MainScreen render");

  const formApiRef = useRef<UseFormReturn<PersonalDetailsValues> | null>(null);

  const accountsError = useInfluencerSignupStore((s) => s.accountsError);
  // const submitError = useInfluencerSignupStore((s) => s.submitError);

  const validateAccounts = useInfluencerSignupStore((s) => s.validateAccounts);
  const setSubmitError = useInfluencerSignupStore((s) => s.setSubmitError);
  const resetSignup = useInfluencerSignupStore((s) => s.resetSignup);
  const setPersonalFields = useInfluencerSignupStore((s) => s.setPersonalFields);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const getAccounts = useCallback(
    (platform: TSocialAccounts) => signupAccountsForList(platform, useInfluencerSignupStore.getState().user),
    [],
  );

  const handleSignup = async () => {
    if (isLoading) return;

    setSubmitError(null);

    const api = formApiRef.current;
    if (!api) return;

    const isPersonalValid = await api.trigger();
    const hasAccounts = validateAccounts();

    if (!isPersonalValid || !hasAccounts) return;

    setPersonalFields(api.getValues());

    setIsLoading(true);
    try {
      console.log("Submitting influencer signup with data: ", useInfluencerSignupStore.getState().user);
      await influencerSignupApi(useInfluencerSignupStore.getState().user);
      setIsSuccess(true);
      resetSignup();
    } catch (e: any) {
      setSubmitError(e?.response?.data?.message ?? "Server error");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <SignupInfluencerSuccess/>
    );
  }

  return (
    <div className="signup-influencer">
      <div className="signup-influencer__header">
        <h1 className="signup-influencer__title">Complete your application</h1>
        <p className="signup-influencer__subtitle">Get approved to join the SoundInfluencers network</p>
      </div>

      {/*<p className="signup-influencer__inputs-label">Add Your Personal Details</p>*/}
      <SignupPersonalDetailsForm exposeForm={(api) => (formApiRef.current = api)}/>

      <div className="signup-influencer__socials">
        <div className="signup-influencer__socials-header">
          <p className="signup-influencer__socials-title">Connect your social accounts</p>
          <p className="signup-influencer__socials-subtitle">Add at least one platform to submit your application</p>
        </div>


        <p className={`signup-influencer__error ${accountsError ? 'signup-influencer__error--show' : ''}`}
           aria-live={'polite'}
        >
          {accountsError}
        </p>


        <SocialAccountsList
          getAccounts={getAccounts}
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
