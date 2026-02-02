import { useEffect, useState } from "react";
import { useInfluenserSignupStore } from "../../../../../../store/influencer/account-settings/useInfluenserSignupStore";
import { TextInput } from "../../../../../../components/ui/inputs/text-input/TextInput";
import { InputPhone } from "../../ui/phone-input/InputPhone";
import { SocialAccountsList } from "../../../../../influencer/components/social-accounts-list/SocialAccountsList";
import { ButtonMain } from "../../../../../../components/ui/buttons-fix/ButtonFix";
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
    isFormReady,
    submitError,
    setSubmitError,
  } = useInfluenserSignupStore();
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
    if (!isValid) return;

    if (!isFormReady()) {
      setSubmitError("Please add at least one social account.");
      return;
    }

    setIsLoading(true);
    try {
      console.log('Data to signup', user)
      await influencerSignupApi(user);

      setIsSuccess(true);
      resetSignup();
    } catch (e: any) {
      // const message =
      //   e?.response?.data?.message ||
      //   e?.response?.data?.error ||
      //   "Something went wrong. Please try again.";

      console.log("STATUS:", e?.response?.status);
      console.log("DATA:", e?.response?.data);
      console.log("HEADERS:", e?.response?.headers);
      setSubmitError(e?.response?.data?.message ?? "Server error");

      // setSubmitError(String(message));
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = !isFormReady() || isLoading;

  if (isSuccess) {
    return (
      <SignupInfluencerSuccess />
    );
  }

  return (
    <div className="signup-influencer">
      <div className="signup-influencer__header">
        <p className="signup-influencer__title">Complete your application</p>
        <p className="signup-influencer__subtitle">Get approved to join the SoundInfluencers network</p>
        {/* <a
          href="/terms/influencer"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "underline", color: "black" }}>
          Terms and Conditions
        </a> */}
      </div>

      {!!submitError && (
        <div className="signup-influencer__error">
          {submitError}
        </div>
      )}

      <div>
        <p className="signup-influencer__inputs-label">Add Your Personal Details</p>
        <div className="signup-influencer__inputs">
          <TextInput
            title="First name*"
            placeholder="Enter first name"
            value={user.firstName}
            setValue={(v) => setField('firstName', v.trim())}
            isError={errors.firstName}
          />
          <TextInput
            title="Last name*"
            placeholder="Enter last name"
            value={user.lastName}
            setValue={(v) => setField('lastName', v.trim())}
            isError={errors.lastName}
          />
          <TextInput
            title="Email*"
            type="email"
            placeholder="Enter email"
            value={user.email}
            setValue={(v) => setField('email', v.trim())}
            isError={errors.email}
          />
          <InputPhone
            value={user.phone}
            setValue={(v) => setField('phone', v.trim())}
            isMenuOpen={isPhoneDropdownOpen}
            setIsMenuOpen={setIsPhoneDropdownOpen}
          />
          <TextInput
            title="Password*"
            type="password"
            value={user.password}
            placeholder="Enter password"
            setValue={(v) => setField('password', v)}
            isError={errors.password}
          />
        </div>
      </div>

      <div className="signup-influencer__socials">
        <div className="signup-influencer__socials-header">
          <p className="signup-influencer__socials-title">Connect your social accounts</p>
          <p className="signup-influencer__socials-subtitle">Add at least one platform to submit your application</p>
        </div>

        <SocialAccountsList
          getAccounts={(platform: TSocialAccounts) => signupAccountsForList(platform, user)}
        />
      </div>

      <div className="signup-influencer__controls">
        <ButtonMain
          label={isLoading ? "Submitting..." : "Submit Application"}
          onClick={handleSignup}
          isDisabled={isDisabled}
        />
      </div>
    </div>
  );
};