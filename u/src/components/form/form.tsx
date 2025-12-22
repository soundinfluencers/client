import { FormProvider, useForm } from "react-hook-form";
import type { FormSchema } from "./renderFunctions/schemas/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
// reusable form with ZOD validation //

import "./_form.scss";
import React from "react";
import type { ZodTypeAny } from "zod/v3";

// interface FormSection includes data reliable to form //

interface FormSection {
  children: React.ReactNode;
  submitButton?: React.ReactNode;
  isPassword?: boolean;
  isEmail?: boolean;
  className?: string;
  classNameBtnSection?: string;

  isConfirm?: boolean;
  schema?: ZodTypeAny;
  // onSubmit?: (data: DynamicFormData) => Promise<void> | void;
  onSubmit?: () => void;
}

type DynamicFormData = Record<string, string>;

export const Form = ({
  children,
  submitButton,
  className,
  classNameBtnSection,
  onSubmit,
  schema,
}: FormSection) => {
  const methods = useForm();
  const handleFormSubmit = async (formData: DynamicFormData) => {
    console.log(formData, "form");
    if (onSubmit) {
      onSubmit();
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        className={`form ${className}`}
        onSubmit={methods.handleSubmit(handleFormSubmit)}>
        {children}
        <div className={`button-section ${classNameBtnSection}`}>
          {submitButton}
        </div>
      </form>
    </FormProvider>
  );
};
