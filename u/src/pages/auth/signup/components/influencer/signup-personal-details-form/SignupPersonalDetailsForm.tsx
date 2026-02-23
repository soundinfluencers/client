import React from "react";
import { BaseInput, Form } from "@/components";
import { BaseMaskedPasswordInput } from "@components/ui/base-masked-password-input/BaseMaskedPasswordInput.tsx";
import { PhoneInputV2 } from "@components/ui/phone-input-v2/PhoneInputV2.tsx";
import { useInfluencerSignupStore } from "@/store/influencer/account-settings/useInfluenserSignupStore.ts";
import { useFormContext, type UseFormReturn } from "react-hook-form";
import type {
  PersonalDetailsValues,
} from "@/pages/auth/signup/components/influencer/signup-personal-details-form/types/personal-details-form.types.ts";
import {
  personalDetailsSchema,
} from "@/pages/auth/signup/components/influencer/signup-personal-details-form/validation/personalDetails.schema.ts";
import './_signup-personal-details-form.scss';

// TODO: optimize with lazy loading (need to check if it causes any issues with form context)
// const PhoneInputV2 = React.lazy(() => import("@components/ui/phone-input-v2/PhoneInputV2.tsx"));

export const SignupPersonalDetailsForm = ({ exposeForm }: {
  exposeForm: (api: UseFormReturn<PersonalDetailsValues>) => void
}) => {
  const user = useInfluencerSignupStore((s) => s.user);

  return (
    <div className={'personal-details-form'}>
      <p className="personal-details-form__title">Add Your Personal Details</p>
      <Form<PersonalDetailsValues>
        className={'personal-details-form__form'}
        defaultValues={{
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          password: user.password,
        }}
        schema={personalDetailsSchema}
        expose={exposeForm}
      >
        <PersonalDetailsSyncToStore/>

        <BaseInput
          name={'firstName'}
          label={'First name*'}
          placeholder={'Enter first name'}
          type={'text'}
        />
        <BaseInput
          name={'lastName'}
          label={'Last name*'}
          placeholder={'Enter last name'}
          type={'text'}
        />
        <BaseInput
          name={'email'}
          label={'Email*'}
          placeholder={'Enter email'}
          type={'email'}
        />

        <PhoneInputV2
          name={'phone'}
          label={'Phone number*'}
        />

        <BaseMaskedPasswordInput
          name={'password'}
          label={'Password*'}
          placeholder={'Enter password'}
        />
      </Form>
    </div>
  )
};

/*
* This component is used to sync form values to the store in real-time as the user types.
* It subscribes to form value changes and updates the store accordingly.
* This ensures that the store always has the latest form values,
* which can be useful for multi-step forms or when navigating between different sections of the signup process.
*/
const PersonalDetailsSyncToStore = () => {
  const setPersonalFields = useInfluencerSignupStore((s) => s.setPersonalFields);
  const { watch } = useFormContext<PersonalDetailsValues>();

  React.useEffect(() => {
    const sub = watch((v) => {
      setPersonalFields({
        firstName: v.firstName ?? "",
        lastName: v.lastName ?? "",
        email: v.email ?? "",
        phone: v.phone ?? "",
        password: v.password ?? "",
      });
    });
    return () => sub.unsubscribe();
  }, [watch, setPersonalFields]);

  return null;
};