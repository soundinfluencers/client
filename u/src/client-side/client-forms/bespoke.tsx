import React from "react";
import type { IBespokeCampaignTabData } from "@/types/client/form-clients/bespoke-campaign-tabs-data";
import { FormInput, FormTextArea } from "@/components";
import { BudgetField } from "@/components/ui/inputs/budget-input/budget-input";

export function BespokeArtistForm() {
  return (
    <div className="inputs">
      <FormInput
        required
        name={"Campaign objective" as any}
        label={"Campaign objective"}
        placeholder={"Enter tour, gig, branding push, announcement"}
      />

      <FormInput
        required
        name={"Content available" as any}
        label={"Content available"}
        placeholder={"Enter links to your videos, press photos, artwork"}
      />

      <BudgetField
        name={"Your budget"}
        label={"Your budget*  "}
        placeholder={"Enter your budget"}
      />

      <FormInput
        name={"Target territories" as any}
        label={"Target territories"}
        placeholder={"Leave it empty for worldwide campaign"}
      />

      <FormTextArea
        name={"Any Extra Briefs" as any}
        label={"Any Extra Briefs"}
        placeholder={
          "Enter here any details or ideas you'd like us to consider while designing your campaign"
        }
        isBespoke
      />
    </div>
  );
}
export function BespokeMusicForm() {
  return (
    <div className="inputs">
      <FormInput
        name={"Campaign objective" as any}
        label={"Campaign objective"}
        placeholder={"Enter tour, gig, branding push, announcement"}
      />

      <FormInput
        required
        name={"Content available" as any}
        label={"Content available"}
        placeholder={"Enter links to your videos, press photos, artwork"}
      />

      <FormInput
        name={"Download or private link to the track" as any}
        label={"Download or private link to the track"}
        placeholder={"Download or private link to the track"}
      />

      <FormInput
        name={"Release date" as any}
        label={"Release date"}
        placeholder={"Enter release date"}
      />

      <FormInput
        name={"Enter linkfire / smartlink" as any}
        label={"Linkfire / smartlink"}
        placeholder={"Enter linkfire / smartlink"}
      />

      <BudgetField
        name={"Your budget"}
        label={"Your budget*"}
        placeholder={"Enter your budget"}
      />

      <FormInput
        name={"Target territories" as any}
        label={"Target territories"}
        placeholder={
          "Enter target territories (leave it empty for worldwide campaign)"
        }
      />

      <FormTextArea
        name={
          "Any extra notes (messaging, influencer type, content ideas)" as any
        }
        label={"Any extra notes (messaging, influencer type, content ideas)"}
        placeholder={"Enter messaging, influencer type, content ideas"}
        isBespoke
      />
    </div>
  );
}
export function BespokeEventForm() {
  return (
    <div className="inputs">
      <FormInput
        name={"What you’re promoting (Campaign Goal)" as any}
        label={"What you’re promoting (Campaign Goal)"}
        placeholder={"Enter tour, gig, branding push, announcement"}
      />

      <FormInput
        required
        name={"Content available" as any}
        label={"Content available"}
        placeholder={"Enter links to your videos, press photos, artwork"}
      />

      <FormInput
        name={"Ticket link" as any}
        label={"Ticket link"}
        placeholder={"Enter ticket link"}
      />

      <BudgetField
        name={"Your budget"}
        label={"Your budget*"}
        placeholder={"Enter your budget"}
      />

      <FormInput
        name={"Target territories" as any}
        label={"Target territories"}
        placeholder={
          "Enter target territories (leave it empty for worldwide campaign)"
        }
      />

      <FormTextArea
        name={
          "Any extra notes (messaging, influencer type, content ideas)" as any
        }
        label={"Any extra notes (messaging, influencer type, content ideas)"}
        placeholder={"Enter messaging, influencer type, content ideas"}
        isBespoke
      />
    </div>
  );
}
export function BespokeOtherForm() {
  return (
    <div className="inputs">
      <FormTextArea
        name={"Brief" as any}
        label={"Brief"}
        placeholder={"Enter brief here"}
        isBespoke
      />
    </div>
  );
}
