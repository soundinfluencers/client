import { FormProvider, useForm } from "react-hook-form";
import type { FormSchema } from "./renderFunctions/schemas/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
// reusable form with ZOD validation //

import "./_form.scss";
import React from "react";
import type { ZodTypeAny } from "zod/v3";

// interface FormSection includes data reliable to form //
type DynamicFormData = Record<string, string | number | FileList | undefined>;

interface FormSection {
  children: React.ReactNode;

  submitButton?: React.ReactNode;

  className?: string;
  classNameBtnSection?: string;

  defaultValues?: Record<string, string | number | FileList | undefined>;

  schema?: ZodTypeAny;
  onSubmit?: (data: DynamicFormData) => Promise<void> | void;
}

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
    resolver: schema ? zodResolver(schema) : undefined,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const handleFormSubmit = async (formData: DynamicFormData) => {
    console.log(formData, "form");
    if (onSubmit) {
      await onSubmit(formData);
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
