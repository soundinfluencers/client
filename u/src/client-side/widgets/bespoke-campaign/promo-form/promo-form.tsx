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
import { toast } from "react-toastify";

interface Props {
  activeTabId: string;
}
const buildBespokePayload = (
  category: "artist" | "music" | "event" | "other",
  values: Record<string, any>,
) => {
  if (category === "other") {
    return {
      brief: values["Brief"],
    };
  }

  const base = {
    campaignGoal: values["What you’re promoting (Campaign Goal)"],
    contentLink: values["Content available"],
    budget: Number(values["Your budget"]),
    targetTerritories: values["Target territories"],
    extraBriefs:
      values["Any extra notes (messaging, influencer type, content ideas)"],
  };

  if (category === "music") {
    return {
      ...base,
      trackLink: values["Download or private link to the track"],
      releaseDate: values["Release date"],
      smartLink: values["Enter linkfire / smartlink"], // у тебя так в константе name
    };
  }

  if (category === "event") {
    return {
      ...base,
      ticketLink: values["Ticket link"],
    };
  }

  return base; // artist
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
          const payload = buildBespokePayload(category, values);
          console.log(category);
          console.log(payload);
          await postBespokeCampaign({
            category,
            payload,
          });
          toast.success("Agency campaign sent successfully.");
        }}>
        <BespokeForm data={promoFormData} />
      </Form>
    </div>
  );
};
