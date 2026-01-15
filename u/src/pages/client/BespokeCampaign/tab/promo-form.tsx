import React from "react";
import "./_promo-form.scss";
import { BespokeForm } from "@/pages/client/components/client-forms/bespoke";
import { SubmtiButton } from "@/components/ui/submit-button/submit-button";
import { Form } from "@/components";
import { BESPOKE_CAMPAIGN_TABS_DATA } from "@/constants/client/bespoke-capaign-tabs.data";
interface Props {
  activeTabId: string;
}

export const PromoForm: React.FC<Props> = ({ activeTabId }) => {
  const PromoFormData = BESPOKE_CAMPAIGN_TABS_DATA.find(
    (data) => data.promoType === activeTabId
  );
  if (!PromoFormData) return;
  return (
    <div className="promo-form">
      {PromoFormData?.title && (
        <div className="promo-form__title">
          <h2>{PromoFormData?.title}</h2>
        </div>
      )}
      <Form submitButton={<SubmtiButton data="Create" />}>
        <BespokeForm data={PromoFormData} />
      </Form>
    </div>
  );
};
