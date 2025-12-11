import "../../_signup-page.scss";
import { TextInput } from "../../../../../components/ui/inputs/text-input/TextInput.tsx";
import { ButtonMain } from "../../../../../components/ui/buttons/button/Button.tsx";
import { RadioButton } from "../../../../../components/ui/buttons/radio/RadioButton.tsx";
import { useState } from "react";
import { InputPhone } from "../ui/phone-input/InputPhone.tsx";
import { ClientCompanySelect } from "../ui/client-company-select/ClientCompanySelect.tsx";
import type { ClientCompanyType } from "../../../../../types/user/user.types.ts";
import { useSignupClientStore } from "../../../../../store/features/signupClient.ts";

export const SignupClient = () => {
  const fields = useSignupClientStore((state) => state);
  const [isPhoneDropdownOpen, setIsPhoneDropdownOpen] = useState(false);
  const [isCompanyTypeDropdownOpen, setIsCompanyTypeDropdownOpen] =
    useState(false);
  const [repeatPassword, setRepeatPassword] = useState<string>("");

  const handleSignup = () => {
    console.log(fields);
  };

  return (
    <div className="signup-client">
      <div className="signup-client__title-block">
        <p className="signup-client__title">Add your details here</p>
        <p className="signup-client__subtitle">
          to get approved as a Sponsoring Client
        </p>
      </div>

      <div className="signup-client__inputs">
        <TextInput
          title="First name"
          value={fields.firstName}
          setValue={(value) => fields.setField("firstName", value)}
          placeholder="Enter first name"
        />
        <TextInput
          title="Last name"
          value={fields.lastName}
          setValue={(value) => fields.setField("lastName", value)}
          placeholder="Enter last name"
        />
        <TextInput
          title="Company"
          value={fields.company}
          setValue={(value) => fields.setField("company", value)}
          placeholder="Enter company"
        />
        <ClientCompanySelect
          selectedType={fields.companyType}
          selectType={(value: ClientCompanyType) =>
            fields.setField("companyType", value)
          }
          isMenuOpen={isCompanyTypeDropdownOpen}
          setIsMenuOpen={setIsCompanyTypeDropdownOpen}
        />
        <TextInput
          title="Instagram"
          value={fields.instagramLink}
          setValue={(value) => fields.setField("instagramLink", value)}
          placeholder="Enter instagram link"
        />
        <TextInput
          title="Email"
          value={fields.email}
          setValue={(value) => fields.setField("email", value)}
          placeholder="Enter email"
        />
        <InputPhone
          value={fields.phone ?? ""}
          setValue={(value) => fields.setField("phone", value)}
          isMenuOpen={isPhoneDropdownOpen}
          setIsMenuOpen={setIsPhoneDropdownOpen}
        />
        <TextInput
          title="Referral code"
          value={fields.referralCode ?? ""}
          setValue={(value) => fields.setField("referralCode", value)}
          placeholder="Enter referral code"
        />
        <TextInput
          title="Password"
          value={fields.password}
          setValue={(value) => fields.setField("password", value)}
          type="password"
          placeholder="Enter password"
        />
        <TextInput
          title="Repeat password"
          value={repeatPassword}
          setValue={(value) => setRepeatPassword(value)}
          type="password"
          placeholder="Repeat password"
        />
      </div>
      <div className="signup-client__radio">
        <RadioButton
          content={
            <div className="signup-client__radio-content">
              <p>
                Agree to{" "}
                <a
                  href="/terms/client"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: "underline", color: "black" }}>
                  Terms and Conditions
                </a>
              </p>{" "}
            </div>
          }
          size="lg"
        />
      </div>
      <div className="signup-client__controls">
        <ButtonMain isDisabled={true} text="Apply now" onClick={handleSignup} />
      </div>
    </div>
  );
};
