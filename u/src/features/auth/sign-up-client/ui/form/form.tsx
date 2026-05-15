import React from 'react';
import {
  FormProvider,
  type FieldValues,
  type UseFormReturn,
} from 'react-hook-form';

import clsx from 'clsx';

interface FormProps<
  TFieldValues extends FieldValues,
  TContext = unknown,
  TTransformedValues extends FieldValues | undefined = undefined,
> {
  children: React.ReactNode;
  className?: string;
  methods: UseFormReturn<TFieldValues, TContext, TTransformedValues>;
  onSubmit?: (e?: React.BaseSyntheticEvent) => void;
  onBlur?: React.FocusEventHandler<HTMLFormElement>;
}

export const Form = <
  TFieldValues extends FieldValues,
  TContext = unknown,
  TTransformedValues extends FieldValues | undefined = undefined,
>({
  children,
  className,
  methods,
  onSubmit,
  onBlur,
}: FormProps<TFieldValues, TContext, TTransformedValues>) => {
  return (
    <FormProvider {...methods}>
      <form
        className={clsx(className)}
        onSubmit={onSubmit}
        onBlur={onBlur}
        noValidate
      >
        {children}
      </form>
    </FormProvider>
  );
};
