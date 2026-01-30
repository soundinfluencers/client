import React from "react";
import "./_promo-form.scss";

import { BespokeForm } from "@/pages/client/components/client-forms/bespoke";
import { SubmitButton } from "@/components/ui/submit-button/submit-button";
import { Form } from "@/components";
import { BESPOKE_CAMPAIGN_TABS_DATA } from "@/constants/client/bespoke-capaign-tabs.data";
import {
  buildPromoTabSchema,
  buildPromoTabDefaultValues,
} from "@/pages/client/components/client-forms/schemas/schema-bespoke";

interface Props {
  activeTabId: string;
}

export const PromoForm: React.FC<Props> = ({ activeTabId }) => {
  const promoFormData = React.useMemo(
    () => BESPOKE_CAMPAIGN_TABS_DATA.find((d) => d.promoType === activeTabId),
    [activeTabId],
  );

  if (!promoFormData) return null;

  const schema = React.useMemo(
    () => buildPromoTabSchema(promoFormData),
    [promoFormData],
  );
  const defaultValues = React.useMemo(
    () => buildPromoTabDefaultValues(promoFormData),
    [promoFormData],
  );

  return (
    <div className="promo-form">
      {promoFormData.title && (
        <div className="promo-form__title">
          <h2>{promoFormData.title}</h2>
        </div>
      )}

      <Form
        schema={schema as any}
        defaultValues={defaultValues as any}
        submitButton={<SubmitButton className="bespoke-btn" data="Create" />}
        onSubmit={(values) => {
          console.log("VALID", values);
        }}>
        <BespokeForm data={promoFormData} />
      </Form>
    </div>
  );
};
