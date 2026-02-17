import React from "react";
import "./_campaign-post-content.scss";

import { useNavigate } from "react-router-dom";
import {
  Breadcrumbs,
  ButtonSecondary,
  Container,
  Form,
  FormInput,
  SubmitButton,
} from "@/components";

import { Selection } from "@/client-side/widgets";

import { platformFormsMap } from "@/client-side/constants/plattforms-data-form";
import { getSocialMediaIcon } from "@/constants/social-medias";

import type { SocialMediaType } from "@/types/utils/constants.types";
import { useSelectedPlatforms } from "@/client-side/hooks";
import { useAdditionalForms } from "@/client-side/hooks";
import { campaignPostContentSchema } from "@/client-side/schemas";
import {
  AdditionalPlatformForm,
  PlatformForm,
} from "@/client-side/client-forms";
import { useCampaignStore } from "@/client-side/store";
import { groupPlatforms } from "@/client-side/utils";

export type GroupKey = "main" | "music" | "press";
export const CampaignPostContent: React.FC = () => {
  const [selectedEntity, setSelectedEntity] = React.useState(0);
  const navigate = useNavigate();

  const offer = useCampaignStore((s) => s.offer);
  const promoCard = useCampaignStore((s) => s.promoCard);
  const totalPrice = useCampaignStore((s) => s.totalPrice);
  const actions = useCampaignStore((s) => s.actions);
  const postContentDraft = useCampaignStore((s) => s.postContentDraft);
  console.log(postContentDraft, "awd");
  const selectedPlatforms = useSelectedPlatforms(offer, promoCard);

  type Entity = 0 | 1;
  const [selectedEntityByForm, setSelectedEntityByForm] = React.useState<
    Record<string, Entity>
  >({});
  const getEntity = (prefix: string): Entity =>
    selectedEntityByForm[prefix] ?? 0;
  const setEntity = (prefix: string, v: Entity) =>
    setSelectedEntityByForm((prev) => ({ ...prev, [prefix]: v }));

  const grouped = React.useMemo(
    () => groupPlatforms(selectedPlatforms),
    [selectedPlatforms],
  );
  const PeopleChose = ({
    value,
    onChange,
  }: {
    value: 0 | 1;
    onChange: (v: 0 | 1) => void;
  }) => (
    <div className="people-chose">
      <ButtonSecondary
        className={`for-class ${value === 0 ? "active" : ""}`}
        text="For creators"
        onClick={() => onChange(0)}
      />
      <ButtonSecondary
        className={`for-class ${value === 1 ? "active" : ""}`}
        text="For communities"
        onClick={() => onChange(1)}
      />
    </div>
  );
  const {
    additionalSelection,
    toggleAdditionalSelection,
    addAdditionalForm,
    groupAdditionalByGroup,
    getAdditionalIndex,
    getFormPrefix,
  } = useAdditionalForms(postContentDraft ?? undefined);

  const handleSubmit = React.useCallback(
    (formData: Record<string, string>) => {
      console.log(Object.keys(formData));
      console.log("=== FORM SUBMIT ===");
      console.log("formData keys:", Object.keys(formData));
      console.log("formData:", formData);
      if (formData.campaignName) actions.setCampaignName(formData.campaignName);
      console.log(formData, "formData");
      (["main", "music", "press"] as const).forEach((group) => {
        const platforms = grouped[group];
        if (!platforms?.length) return;

        platforms.forEach((platform) => {
          actions.addPostContent(group, formData, platform);
        });
      });

      actions.setPostContentDraft(formData);
      actions.buildCampaignContentFromForm(
        formData,
        selectedPlatforms,
        grouped,
      );

      navigate("/client/create-campaign/content/strategy");
    },
    [actions, grouped, navigate, selectedPlatforms],
  );

  // const renderGroup = (group: GroupKey) => {
  //   const platforms = grouped[group] as SocialMediaType[];
  //   if (!platforms?.length) return null;

  //   const baseForm = platformFormsMap[group];
  //   const additional = groupAdditionalByGroup[group];

  //   return (
  //     <div key={group} className="platform-group">
  //       <PlatformForm
  //         selectedEntity={selectedEntity}
  //         data={baseForm}
  //         selectedPlatforms={platforms}
  //         formPrefix={`${group}-0`}
  //       />

  //       {additional.map((f) => {
  //         const n = getAdditionalIndex(f.id);

  //         return (
  //           <AdditionalPlatformForm
  //             selectedEntity={selectedEntity}
  //             key={f.id}
  //             data={{
  //               ...baseForm,
  //               _id: f.id,
  //               platform: group,
  //               socialMedia: f.socialMedia,
  //             }}
  //             index={n - 1}
  //             formPrefix={getFormPrefix(f)}
  //           />
  //         );
  //       })}

  //       <ButtonSecondary
  //         className="additional-button"
  //         text={`Add additional ${baseForm.contentTitle}`}
  //         onClick={() => toggleAdditionalSelection(group)}
  //       />

  //       <div className="people-chose">
  //         <ButtonSecondary
  //           className={`for-class ${selectedEntity === 0 ? "active" : ""}`}
  //           text={`For creators`}
  //           onClick={() => setSelectedEntity(0)}
  //         />
  //         <ButtonSecondary
  //           className={`for-class ${selectedEntity === 1 ? "active" : ""}`}
  //           text={`For communities`}
  //           onClick={() => setSelectedEntity(1)}
  //         />
  //       </div>

  //       {additionalSelection === group && (
  //         <div className="additional-selection">
  //           <p>Choose the platform for additional post brief</p>
  //           <ul>
  //             {platforms.map((p) => (
  //               <li key={p} onClick={() => addAdditionalForm(group, p)}>
  //                 <img src={getSocialMediaIcon(p)} alt={p} />
  //               </li>
  //             ))}
  //           </ul>
  //         </div>
  //       )}
  //     </div>
  //   );
  // };
  const renderGroup = (group: GroupKey) => {
    const platforms = grouped[group] as SocialMediaType[];
    if (!platforms?.length) return null;

    const baseForm = platformFormsMap[group];
    const additional = groupAdditionalByGroup[group];

    const basePrefix = `${group}-0`;
    const baseEntity = getEntity(basePrefix);

    return (
      <div key={group} className="platform-group">
        <PlatformForm
          selectedEntity={baseEntity}
          data={baseForm}
          selectedPlatforms={platforms}
          formPrefix={basePrefix}
        />

        <PeopleChose
          value={baseEntity}
          onChange={(v) => setEntity(basePrefix, v)}
        />

        {additional.map((f) => {
          const n = getAdditionalIndex(f.id);
          const prefix = getFormPrefix(f);
          const entity = getEntity(prefix);

          return (
            <React.Fragment key={f.id}>
              <AdditionalPlatformForm
                selectedEntity={entity}
                data={{
                  ...baseForm,
                  _id: f.id,
                  platform: group,
                  socialMedia: f.socialMedia,
                }}
                index={n - 1}
                formPrefix={prefix}
              />

              <PeopleChose
                value={entity}
                onChange={(v) => setEntity(prefix, v)}
              />
            </React.Fragment>
          );
        })}

        <ButtonSecondary
          className="additional-button"
          text={`Add additional ${baseForm.contentTitle}`}
          onClick={() => toggleAdditionalSelection(group)}
        />

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
        )}
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

            <Form<Record<string, string>>
              schema={campaignPostContentSchema}
              className="form-width"
              onSubmit={handleSubmit}
              defaultValues={postContentDraft ?? {}}
              submitButton={
                <SubmitButton
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
