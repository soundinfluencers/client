import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bundleFormSchema, type TBundleFormValues } from "./create-bundle-form.schema";

interface CreateBundleFormParams {
  onHandleSubmit: (values: TBundleFormValues) => Promise<void> | void;
}

export const useCreateBundleForm = ({
  onHandleSubmit,
}: CreateBundleFormParams) => {
  const methods = useForm<TBundleFormValues>({
    resolver: zodResolver(bundleFormSchema),
    defaultValues: {
      price: 0,
      currency: "EUR",
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const onSubmit: SubmitHandler<TBundleFormValues> = async (values) => {
    try {
      await onHandleSubmit(values);
      methods.reset();
    } catch {
      // API errors are displayed by the shared response interceptor.
      // Keep form values so the user can correct and resubmit them.
    }
  };

  return {
    methods,
    onSubmit,
  };
};
