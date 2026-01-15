import { useState } from "react";
import { useInfluenserSignupStore } from "../../../../../../store/influencer/account-settings/useInfluenserSignupStore";
import { TextInput } from "../../../../../../components/ui/inputs/text-input/TextInput";
import { InputPhone } from "../../ui/phone-input/InputPhone";
import { SocialAccountsList } from "../../../../../influencer/components/social-accounts-list/SocialAccountsList";
import { ButtonMain } from "../../../../../../components/ui/buttons-fix/ButtonFix";

import './_main-screen.scss';

/*
  TODO: check item bg (glass?)
*/

export const MainScreen = () => {
  const { user, errors, validate, setField, resetSignup, isFormReady } = useInfluenserSignupStore();
  const [isPhoneDropdownOpen, setIsPhoneDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    const isValid = validate();
    if (!isValid) {
      return;
    }

    console.log("Payload influencer", user);
    setIsLoading(true);
    // simulate api call
    await new Promise((resolve) => setTimeout(resolve, 3000));

    setIsLoading(false);
    resetSignup();
  };

  const isDisabled = !isFormReady() || isLoading;

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
            setValue={(v) => setField('password', v.trim())}
            isError={errors.password}
          />
        </div>
      </div>

      <div className="signup-influencer__socials">
        <div className="signup-influencer__socials-header">
          <p className="signup-influencer__socials-title">Connect your social accounts</p>
          <p className="signup-influencer__socials-subtitle">Add at least one platform to submit your application</p>
        </div>

        <SocialAccountsList user={user} />
      </div>

      <div className="signup-influencer__controls">
        {/* TODO: Add validation and disable button if necessary */}
        <ButtonMain
          label={isLoading ? "Submitting..." : "Submit Application"}
          onClick={handleSignup}
          isDisabled={isDisabled}
        />
      </div>
    </div>
  )
}