import React from "react";
import "./_campaign-post-content.scss";

import { useNavigate } from "react-router-dom";
import {
  Breadcrumbs,
  ButtonSecondary,
  Container,
  Form,
  FormInput,
  SubmtiButton,
} from "@/components";

import { PlatformForm } from "@/pages/client/components/client-forms/plattform";
import { AdditionalPlatformForm } from "@/pages/client/components/client-forms/additional-from-plattform";
import { Selection } from "./selection/selection-post-content";

import { useCampaignStore } from "@/store/client/createCampaign";

import { groupPlatforms } from "@/utils/functions/groupPlatforms";
import { platformFormsMap } from "@/constants/client/plattforms-data-form";
import { getSocialMediaIcon } from "@/constants/social-medias";

import type { SocialMediaType } from "@/types/utils/constants.types";
import { useSelectedPlatforms } from "./hooks/useSelectedPlatforms";

type GroupKey = "main" | "music" | "press";

type AdditionalForm = {
  id: string;
  group: GroupKey;
  socialMedia: SocialMediaType;
};

export const CampaignPostContent: React.FC = () => {
  const [selectedEntity, setSelectedEntity] = React.useState(0);
  const navigate = useNavigate();

  const offer = useCampaignStore((s) => s.offer);
  const promoCard = useCampaignStore((s) => s.promoCard);
  const totalPrice = useCampaignStore((s) => s.totalPrice);
  const actions = useCampaignStore((s) => s.actions);

  const selectedPlatforms = useSelectedPlatforms(offer, promoCard);

  const grouped = React.useMemo(() => {
    return groupPlatforms(selectedPlatforms);
  }, [selectedPlatforms]);

  const [additionalSelection, setAdditionalSelection] =
    React.useState<GroupKey | null>(null);

  const [additionalForms, setAdditionalForms] = React.useState<
    AdditionalForm[]
  >([]);

  const additionalByGroup = React.useMemo(() => {
    const map: Record<GroupKey, AdditionalForm[]> = {
      main: [],
      music: [],
      press: [],
    };
    for (const f of additionalForms) map[f.group].push(f);
    return map;
  }, [additionalForms]);

  const toggleAdditionalSelection = React.useCallback((group: GroupKey) => {
    setAdditionalSelection((prev) => (prev === group ? null : group));
  }, []);

  const addAdditionalForm = React.useCallback(
    (group: GroupKey, socialMedia: SocialMediaType) => {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}_${Math.random()}`;

      setAdditionalForms((prev) => [...prev, { id, group, socialMedia }]);
      setAdditionalSelection(null);
    },
    [],
  );

  const handleSubmit = React.useCallback(
    (formData: Record<string, string>) => {
      if (formData.campaignName) actions.setCampaignName(formData.campaignName);

      (["main", "music", "press"] as const).forEach((group) => {
        const platforms = grouped[group];
        if (!platforms?.length) return;

        platforms.forEach((platform) => {
          actions.addPostContent(group, formData, platform);
        });
      });

      actions.buildCampaignContentFromForm(
        formData,
        selectedPlatforms,
        grouped,
      );

      navigate("/client/CreateCampaign/Content/Strategy");
    },
    [actions, grouped, navigate, selectedPlatforms],
  );

  const renderGroup = (group: GroupKey) => {
    const platforms = grouped[group] as SocialMediaType[];
    if (!platforms?.length) return null;

    const baseForm = platformFormsMap[group];
    const additional = additionalByGroup[group];

    return (
      <div key={group} className="platform-group">
        <PlatformForm
          selectedEntity={selectedEntity}
          data={baseForm}
          selectedPlatforms={platforms}
          formPrefix={`${group}-0`}
        />
        {additional.map((f, index) => (
          <AdditionalPlatformForm
            selectedEntity={selectedEntity}
            key={f.id}
            data={{
              ...baseForm,
              _id: f.id,
              platform: group,
              socialMedia: f.socialMedia,
            }}
            index={index}
            formPrefix={`${group}-${f.socialMedia}-additional-${index + 1}`}
          />
        ))}
        <ButtonSecondary
          className="additional-button"
          text={`Add additional ${baseForm.contentTitle}`}
          onClick={() => toggleAdditionalSelection(group)}
        />
        <div className="people-chose">
          <ButtonSecondary
            className={`for-class ${selectedEntity === 0 ? "active" : ""}`}
            text={`For creators`}
            onClick={() => setSelectedEntity(0)}
          />{" "}
          <ButtonSecondary
            className={`for-class ${selectedEntity === 1 ? "active" : ""}`}
            text={`For communities`}
            onClick={() => setSelectedEntity(1)}
          />
        </div>
        {additionalSelection === group && (
          <div className="additional-selection">
            <p>Choose the platform for additional post brief</p>
            <ul>
              {platforms.map((p) => (
                <li key={p} onClick={() => addAdditionalForm(group, p)}>
                  <img src={getSocialMediaIcon(p)} alt={p} />
                </li>
              ))}
            </ul>
          </div>
        )}{" "}
      </div>
    );
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
            </div>

            <Form
              className="form-width"
              onSubmit={handleSubmit}
              submitButton={
                <SubmtiButton
                  className="submit"
                  type="submit"
                  data="Continue"
                />
              }>
              <FormInput
                id="campaignName"
                label="Campaign Name"
                name="campaignName"
                placeholder="Enter campaign name"
                required
              />

              {renderGroup("main")}
              {renderGroup("music")}

              {renderGroup("press")}
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
