import React from "react";
import { useSignUpClientForm } from "@/features/auth/sign-up-client/model/use-sign-up-client-form.ts";



import type { TSignUpClientFormValues } from "@/features/auth/sign-up-client/model/sign-up-client-form.schema.ts";

import s from './sign-up-client-form.module.scss';
import {Form} from "@/features/auth/sign-up-client/ui/form/form.tsx";
import {TextInput} from "@/features/auth/sign-up-client/ui/text-input/text-input.tsx";
import {CompanyTypeField} from "@/features/auth/sign-up-client/ui/company-type-field/company-type-field.tsx";
import {PhoneField} from "@/features/auth/sign-up-client/ui/phone-field/phone-field.tsx";
import {MaskedPasswordInput} from "@/features/auth/sign-up-client/ui/masked-password-input/masked-password-input.tsx";
import {Button} from "@/features/auth/sign-up-client/ui/button/button.tsx";
import {CircleLoader} from "@/features/auth/sign-up-client/ui/circle-loader";
import {
  ApplicationUnderReviewModal
} from "@/features/auth/sign-up-client/ui/application-under-review-modal/application-under-review-modal.tsx";

interface SignUpClientFormProps {
  defaultFormValues: TSignUpClientFormValues,
  onDraftSave: (data: TSignUpClientFormValues) => void;
}

export const SignUpClientForm: React.FC<SignUpClientFormProps> = ({
  defaultFormValues,
  onDraftSave,
}) => {
  const {
    methods,
    onSubmit,
    isPending,
    isModalOpen,
    setIsModalOpen,
  } = useSignUpClientForm({
    defaultFormValues,
  });

  return (
    <>
      <Form
        methods={methods}
        onSubmit={methods.handleSubmit(onSubmit)}
        onBlur={() => onDraftSave(methods.getValues())}
        className={s.signUpClientForm}
      >
        <div className={s.fields}>
          <TextInput<TSignUpClientFormValues>
            name={'firstName'}
            label={'First name*'}
            type={'text'}
            placeholder={'Enter first name'}
          />

          <TextInput<TSignUpClientFormValues>
            name={'lastName'}
            label={'Last name*'}
            type={'text'}
            placeholder={'Enter last name'}
          />

          <TextInput<TSignUpClientFormValues>
            name={'company'}
            label={'Company*'}
            type={'text'}
            placeholder={'Enter company name'}
          />

          <CompanyTypeField<TSignUpClientFormValues>
            name={'companyType'}
            label={'Company type*'}
            placeholder={'Choose company type'}
          />

          <TextInput<TSignUpClientFormValues>
            name={'instagramUsername'}
            label={'Instagram*'}
            type={'text'}
            placeholder={'Enter instagram link or username'}
            autoComplete={"new-password"}
          />

          <TextInput<TSignUpClientFormValues>
            name={'email'}
            label={'Email*'}
            type={'email'}
            placeholder={'Enter email'}
            autoComplete={"new-password"}
          />

          <PhoneField<TSignUpClientFormValues>
            name={'phone'}
            label={'Phone*'}
            placeholder={'Enter phone'}
          />

          <TextInput<TSignUpClientFormValues>
            name={'referralCode'}
            label={'Referral code'}
            type={'text'}
            placeholder={'Enter referral code'}
          />

          <MaskedPasswordInput<TSignUpClientFormValues>
            name={'password'}
            label={'Password*'}
            placeholder={'Enter password'}
            autoComplete={"new-password"}
          />
        </div>

        <Button
          type="submit"
          variant={'primary'}
          size={'large'}
          className={s.submitBtn}
          disabled={isPending}
        >
          {isPending ?
            (<CircleLoader size={22} duration={1} color={"#030922"}/>)
            :
            ("Apply now")
          }
        </Button>
      </Form>

      {isModalOpen && (
        <ApplicationUnderReviewModal
          role={"client"}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};
