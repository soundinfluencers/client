import React from "react";
import { BESPOKE_CAMPAIGN_TABS_DATA } from "../../../constants/bespoke-capaign-tabs.data";
import "./_promo-form.scss";
import Form from "../../../components/form/form";
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
      <Form data={PromoFormData}></Form>
    </div>
  );
};
