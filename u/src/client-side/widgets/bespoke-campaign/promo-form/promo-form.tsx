import React from "react";
import "./_promo-form.scss";

import { SubmitButton } from "@/components/ui/submit-button/submit-button";
import { Form } from "@/components";
import { BESPOKE_CAMPAIGN_TABS_DATA } from "@/client-side/constants/bespoke-capaign-tabs.data";
import {
  buildPromoTabDefaultValues,
  buildPromoTabSchema,
} from "@/client-side/schemas";
import { postBespokeCampaign } from "@/api/client/campaign/campaign-bespoke";
import { toast } from "react-toastify";

import {
  BespokeArtistForm,
  BespokeMusicForm,
  BespokeEventForm,
  BespokeOtherForm,
} from "@/client-side/client-forms/bespoke";

interface Props {
  activeTabId: string;
}

export const mapTabToCategory = (
  tabId: string,
): "artist" | "music" | "event" | "other" => {
  const t = tabId.trim().toLowerCase();
  if (t === "artist") return "artist";
  if (t === "music") return "music";
  if (t === "event") return "event";
  return "other";
};

const parseAmount = (v: any) => {
  const s = String(v ?? "");
  const numeric = s
    .replace(/\s/g, "")
    .replace(",", ".")
    .replace(/[^\d.]/g, "");
  return numeric ? Number(numeric) : 0;
};

const mapCurrencySymbolToCode = (symbol: string) => {
  if (symbol === "£") return "GBP";
  if (symbol === "$") return "USD";
  if (symbol === "€") return "EUR";
  return "EUR";
};

// const buildBespokePayload = (
//   category: "artist" | "music" | "event" | "other",
//   values: Record<string, any>,
// ) => {
//   if (category === "other") {
//     return { brief: values["Brief"] };
//   }

//   const budgetRaw = values["Your budget"];
//   const budget = parseBudgetNumber(budgetRaw);
//   const currency = parseBudgetCurrency(budgetRaw);

//   const common = {
//     contentLink: values["Content available"],
//     budget,
//     currency,
//     targetTerritories: values["Target territories"],
//   };

//   if (category === "artist") {
//     return {
//       ...common,
//       campaignGoal: values["Campaign objective"],
//       extraBriefs: values["Any Extra Briefs"],
//     };
//   }

//   if (category === "music") {
//     return {
//       ...common,
//       campaignGoal: values["Campaign objective"],
//       trackLink: values["Download or private link to the track"],
//       releaseDate: values["Release date"],
//       smartLink: values["Enter linkfire / smartlink"],
//       extraBriefs:
//         values["Any extra notes (messaging, influencer type, content ideas)"],
//     };
//   }

//   // event
//   return {
//     ...common,
//     campaignGoal: values["What you’re promoting (Campaign Goal)"],
//     ticketLink: values["Ticket link"],
//     extraBriefs:
//       values["Any extra notes (messaging, influencer type, content ideas)"],
//   };
// };
const buildBespokePayload = (
  category: "artist" | "music" | "event" | "other",
  values: Record<string, any>,
) => {
  if (category === "other") {
    return { brief: values["Brief"] };
  }

  const budget = parseAmount(values["Your budget"]);
  const currencySymbol = values["Your budget currency"];
  const currency = mapCurrencySymbolToCode(currencySymbol);

  const common = {
    contentLink: values["Content available"],
    budget,
    currency,
    targetTerritories: values["Target territories"] || ".",
  };

  if (category === "artist") {
    return {
      ...common,
      campaignGoal: values["Campaign objective"],
      extraBriefs: values["Any Extra Briefs"],
    };
  }

  if (category === "music") {
    return {
      ...common,
      campaignGoal: values["Campaign objective"],
      trackLink: values["Download or private link to the track"],
      releaseDate: values["Release date"],
      smartLink: values["Enter linkfire / smartlink"],
      extraBriefs:
        values["Any extra notes (messaging, influencer type, content ideas)"],
    };
  }

  return {
    ...common,
    campaignGoal: values["What you’re promoting (Campaign Goal)"],
    ticketLink: values["Ticket link"],
    extraBriefs:
      values["Any extra notes (messaging, influencer type, content ideas)"],
  };
};
export const PromoForm: React.FC<Props> = ({ activeTabId }) => {
  const category = React.useMemo(
    () => mapTabToCategory(activeTabId),
    [activeTabId],
  );

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

  const FormView = React.useMemo(() => {
    if (category === "artist") return BespokeArtistForm;
    if (category === "music") return BespokeMusicForm;
    if (category === "event") return BespokeEventForm;
    return BespokeOtherForm;
  }, [category]);

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
          const payload = buildBespokePayload(category, values);

          await postBespokeCampaign({
            category,
            payload,
          });

          toast.success("Agency campaign sent successfully.");
        }}>
        <FormView />
      </Form>
    </div>
  );
};
