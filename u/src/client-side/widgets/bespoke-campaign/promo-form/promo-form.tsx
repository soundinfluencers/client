import React from "react";
import "./_promo-form.scss";

import { SubmitButton } from "@/components/ui/submit-button/submit-button";
import { Form } from "@/components";
import { BESPOKE_CAMPAIGN_TABS_DATA } from "@/client-side/constants/bespoke-capaign-tabs.data";
import {
  buildPromoTabDefaultValues,
  buildPromoTabSchema,
} from "@/client-side/schemas";
import { BespokeForm } from "@/client-side/client-forms";
import { postBespokeCampaign } from "@/api/client/campaign/campaign-bespoke";

interface Props {
  activeTabId: string;
}
export const buildPayloadString = (values: Record<string, unknown>) => {
  return JSON.stringify(values);
};
export const mapTabToCategory = (tabId: string): any => {
  const t = tabId.trim().toLowerCase();
  if (t === "artist") return "artist";
  if (t === "music") return "music";
  if (t === "event") return "event";
  return "other";
};
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
        onSubmit={async (values) => {
          const category = mapTabToCategory(activeTabId);

          console.log(category);
          console.log(values);
          await postBespokeCampaign({
            category,
            payload: values,
          });
        }}>
        <BespokeForm data={promoFormData} />
      </Form>
    </div>
  );
};
