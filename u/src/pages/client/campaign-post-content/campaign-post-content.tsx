import React, { useState } from "react";
import "./_campaign-post-content.scss";

import { useNavigate } from "react-router-dom";
import {
  Breadcrumbs,
  ButtonSecondary,
  Container,
  Form,
  FormInput,
  SaveDraft,
  SubmtiButton,
} from "@/components";
import { PlatformForm } from "@/pages/client/components/client-forms/plattform";
import { Selection } from "./selection/selection-post-content";
import { AdditionalPlatformForm } from "@/pages/client/components/client-forms/additional-from-plattform";

import { useCampaignStore } from "@/store/client/createCampaign";

import { useSelectedPlatforms } from "@/hooks/client/useSelectedPlatforms";
import { groupPlatforms } from "@/utils/functions/groupPlatforms";
import { platformFormsMap } from "@/constants/client/plattforms-data-form";

interface Props {}

export const CampaignPostContent: React.FC<Props> = () => {
  const { offer, promoCard, totalPrice, actions, campaignPayload } =
    useCampaignStore();

  const navigation = useNavigate();

  const selectedPlatforms = useSelectedPlatforms(offer, promoCard);
  const grouped = groupPlatforms(selectedPlatforms);
  console.log("selectedPlatforms", selectedPlatforms);
  console.log("grouped", grouped);
  const [additionalSelection, setAdditionalSelection] = React.useState<
    string | null
  >(null);

  console.log("campaignPayload", campaignPayload);

  const [additionalForms, setAdditionalForms] = useState<any[]>([]);

  const addAdditionalForm = (
    platform: "main" | "music" | "press",
    socialMedia: string
  ) => {
    const platformData = platformFormsMap[platform];
    if (!platformData) return;

    const newForm = {
      ...platformData,
      _id: Date.now() + Math.random() + "",
      platform,
      socialMedia,
    };

    setAdditionalForms((prev) => [...prev, newForm]);
  };

  const handleSubmit = (formData: Record<string, string>) => {
    console.log(formData, "formdata");
    if (formData.campaignName) {
      actions.setCampaignName(formData.campaignName);
    }

    (["main", "music", "press"] as const).forEach((group) => {
      const platforms = grouped[group];
      if (!platforms.length) return;

      platforms.forEach((platform) => {
        actions.addPostContent(group, formData, platform);
      });
    });
    navigation("/CreateCampaign/Content/Strategy");
  };

  return (
    <Container className="campaign-post-content">
      <div className="navmenu">
        <Breadcrumbs />
      </div>
      <div className="campaign-post-content__row">
        <div className="form-block">
          <div className="form-block__sticky">
            <div className="form-block__header">
              <h1>Review this content</h1>
              <SaveDraft />
            </div>
            <Form
              className="form-width"
              onSubmit={handleSubmit}
              submitButton={<SubmtiButton type="submit" data="Continue" />}>
              <FormInput
                id={"campaignName"}
                label={"Campaign Name"}
                name={"campaignName"}
                placeholder={"Enter campaign name"}
                required
              />

              {grouped.main.length > 0 && (
                <div className="platform-group">
                  <PlatformForm data={platformFormsMap.main} />
                  {additionalForms.map((data, index) => (
                    <AdditionalPlatformForm
                      key={data._id}
                      data={data}
                      index={index}
                    />
                  ))}
                  <ButtonSecondary
                    className="additional-button"
                    text={`Add additional ${platformFormsMap.main.contentTitle}`}
                    onClick={() => setAdditionalSelection("main")}
                  />
                  {additionalSelection === "main" && (
                    <ul>
                      {grouped.main.map((item, i) => (
                        <li
                          onClick={() => addAdditionalForm("main", item)}
                          key={i}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {grouped.music.length > 0 && (
                <div className="platform-group">
                  <PlatformForm data={platformFormsMap.music} />
                  {additionalForms.map((data, index) => (
                    <AdditionalPlatformForm
                      key={data._id}
                      data={data}
                      index={index}
                    />
                  ))}
                  <ButtonSecondary
                    className="additional-button"
                    text={`Add additional ${platformFormsMap.music.contentTitle}`}
                    onClick={() => setAdditionalSelection("music")}
                  />
                  {additionalSelection === "music" && (
                    <ul>
                      {grouped.music.map((item, i) => (
                        <li
                          onClick={() => addAdditionalForm("music", item)}
                          key={i}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {grouped.press.length > 0 && (
                <div className="platform-group">
                  <PlatformForm data={platformFormsMap.press} />
                  {additionalForms.map((data, index) => (
                    <AdditionalPlatformForm
                      key={data._id}
                      data={data}
                      index={index}
                    />
                  ))}
                  <ButtonSecondary
                    className="additional-button"
                    text={`Add additional ${platformFormsMap.press.contentTitle}`}
                    onClick={() => setAdditionalSelection("press")}
                  />
                  {additionalSelection === "press" && (
                    <ul>
                      {grouped.press.map((item, i) => (
                        <li
                          onClick={() => addAdditionalForm("press", item)}
                          key={i}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </Form>
          </div>
        </div>

        <Selection
          offer={offer}
          promoCard={promoCard}
          totalPrice={totalPrice}
        />
      </div>
    </Container>
  );
};
