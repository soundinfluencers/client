import React from "react";
import {
  FormProvider,
  useForm,
  type FieldValues,
  type DefaultValues,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodSchema } from "zod";
import "./_form.scss";

interface FormSection<T extends FieldValues> {
  children: React.ReactNode;
  submitButton?: React.ReactNode;
  className?: string;
  classNameBtnSection?: string;

  defaultValues?: DefaultValues<T>;
  schema?: ZodSchema<T>;
  onSubmit?: (data: T) => Promise<void> | void;
}

export const Form = <T extends FieldValues>({
  children,
  submitButton,
  className,
  classNameBtnSection,
  onSubmit,
  defaultValues,
  schema,
}: FormSection<T>) => {
  const methods = useForm<T>({
    defaultValues,
    resolver: schema ? (zodResolver(schema as any) as any) : undefined,

    mode: "onChange",
    reValidateMode: "onChange",

    criteriaMode: "all",
    shouldUnregister: false,
  });

  React.useEffect(() => {
    if (!defaultValues) return;
    methods.reset(defaultValues, {
      keepDirtyValues: true,
      keepTouched: true,
      keepErrors: true,
      keepIsSubmitted: true,
      keepSubmitCount: true,
    });
  }, [defaultValues, methods]);

  const handleFormSubmit = async (formData: any) => {
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
