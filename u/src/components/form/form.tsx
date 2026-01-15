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

  className?: string;
  classNameBtnSection?: string;

  defaultValues?: Record<string, any>;

  schema?: ZodTypeAny;
  onSubmit?: (data: DynamicFormData) => Promise<void> | void;
}

type DynamicFormData = Record<string, any>;

export const Form = ({
  children,
  submitButton,
  className,
  classNameBtnSection,
  onSubmit,
  schema,
  defaultValues
}: FormSection) => {
  const methods = useForm({
    defaultValues,
  });

  const handleFormSubmit = async (formData: DynamicFormData) => {
    console.log(formData, "form");
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        className={`form ${className}`}
        onSubmit={methods.handleSubmit(handleFormSubmit)}>
        {children}
        {submitButton && (
          <div className={`form__btn-section ${classNameBtnSection || ""}`}>
            {submitButton}
          </div>
        )}
      </form>
    </FormProvider>
  );
};
