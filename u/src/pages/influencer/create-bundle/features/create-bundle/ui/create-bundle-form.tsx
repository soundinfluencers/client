

import { PriceInput } from "@/pages/influencer/components/account-setup-form/components/price-input/PriceInput.tsx";
import { useCreateBundleForm } from "../model/use-create-bundle-form.ts";
import type { TBundleFormValues } from "../model/create-bundle-form.schema";

import s from './create-bundle-form.module.scss';
import { Form } from "@/pages/influencer/create-bundle/shared/ui/form";
import { Button } from "@/pages/influencer/create-bundle/shared/ui/button";
import { CircleLoader } from "@/pages/influencer/create-bundle/shared/ui/circle-loader";

interface CreateBundleFormProps {
  onHandleSubmit: (values: TBundleFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
  isSubmitDisabled?: boolean;
}

export const CreateBundleForm = ({
  onHandleSubmit,
  isSubmitting = false,
  isSubmitDisabled = false,
}: CreateBundleFormProps) => {
  const { methods, onSubmit } = useCreateBundleForm({
    onHandleSubmit,
  });

  return (
    <Form
      className={s.form}
      methods={methods}
      onSubmit={methods.handleSubmit(onSubmit)}
    >
      <PriceInput
        placeholder="Enter your custom bundle price"
        label="Set bundle price:"
        helperText="You can offer a discounted price to make your bundle more attractive."
      />

      {/*<PricingField<TBundleFormValues>*/}
      {/*  label="Set bundle price:"*/}
      {/*  placeholder="Enter your custom bundle price"*/}
      {/*  priceName="price"*/}
      {/*  currencyName="currency"*/}
      {/*  helperText="You can offer a discounted price to make your bundle more attractive."*/}
      {/*/>*/}

      <Button
        type="submit"
        variant="primary"
        size="large"
        className={s.submit}
        disabled={isSubmitting || isSubmitDisabled}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? (
          <CircleLoader size={22} duration={1} color="#030922"/>
        ) : (
          "Create Bundle"
        )}
      </Button>

    </Form>
  );
}
