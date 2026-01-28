import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import "./_form.scss";
type DynamicFormData = Record<string, any>;

interface FormSection {
  children: React.ReactNode;
  submitButton?: React.ReactNode;

  className?: string;
  classNameBtnSection?: string;

  defaultValues?: Record<string, any>;
  onSubmit?: (data: DynamicFormData) => Promise<void> | void;
}

export const Form: React.FC<FormSection> = ({
  children,
  submitButton,
  className,
  classNameBtnSection,
  onSubmit,
  defaultValues,
}) => {
  const methods = useForm<DynamicFormData>({
    defaultValues,
    mode: "onChange",
    criteriaMode: "all",
    reValidateMode: "onChange",
    shouldUnregister: false,
  });

  // React.useEffect(() => {
  //   if (!defaultValues) return;
  //   methods.reset(defaultValues);
  //   void methods.trigger();
  // }, [defaultValues, methods]);

  const handleFormSubmit = async (formData: DynamicFormData) => {
    console.log(formData, "dawd");
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
