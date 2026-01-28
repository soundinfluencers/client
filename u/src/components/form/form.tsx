import React from "react";

import type { ZodTypeAny } from "zod/v3";
import { zodResolver } from "@hookform/resolvers/zod";
// interface FormSection includes data reliable to form //
// type DynamicFormData = Record<string, string | number | FileList | undefined>;

import { FormProvider, useForm } from "react-hook-form";
import "./_form.scss";
type DynamicFormData = Record<string, any>;


interface FormSection {
  children: React.ReactNode;
  submitButton?: React.ReactNode;

  className?: string;
  classNameBtnSection?: string;

  defaultValues?: Record<string, any>;

  schema?: ZodTypeAny;
  onSubmit?: (data: DynamicFormData) => Promise<void> | void;
}

// export const Form = ({
//   defaultValues?: Record<string, any>;
//   onSubmit?: (data: DynamicFormData) => Promise<void> | void;
// }

export const Form: React.FC<FormSection> = ({
  children,
  submitButton,
  className,
  classNameBtnSection,
  onSubmit,
  defaultValues,
  schema
}) => {
  const methods = useForm<DynamicFormData>({
    defaultValues,
    resolver: schema ? zodResolver(schema) : undefined,
    // mode: "onSubmit",
    reValidateMode: "onChange",
    mode: "onChange",
    criteriaMode: "all",
    // reValidateMode: "onChange",
    shouldUnregister: false,
  });

  // React.useEffect(() => {
  //   if (!defaultValues) return;
  //   methods.reset(defaultValues);
  //   void methods.trigger();
  // }, [defaultValues, methods]);

  const handleFormSubmit = async (formData: DynamicFormData) => {
    console.log(formData, "form");
    if (onSubmit) {
      await onSubmit(formData);
    }
    if (onSubmit) await onSubmit(formData);
  };

  return (
    <FormProvider {...methods}>
      <form
        className={`form ${className ?? ""}`}
        onSubmit={methods.handleSubmit(handleFormSubmit)}>
        {children}

        {submitButton && (
          <div className={`form__btn-section ${classNameBtnSection ?? ""}`}>
            {submitButton}
          </div>
        )}
      </form>
    </FormProvider>
  );
};
