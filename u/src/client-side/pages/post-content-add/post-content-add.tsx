import React from "react";
import "./_campaign-post-content.scss";

import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Breadcrumbs,
  ButtonSecondary,
  Container,
  Form,
  SubmitButton,
} from "@/components";

import { platformFormsMap } from "@/client-side/constants/plattforms-data-form";
import { getSocialMediaIcon } from "@/constants/social-medias";

import type { SocialMediaType } from "@/types/utils/constants.types";
import {
  useProposalAccountsStore,
  useSelectCampaignProposal,
} from "@/client-side/store";
import { useAdditionalForms } from "@/client-side/hooks";
import { campaignPostContentSchema } from "@/client-side/schemas";
import { SelectionAddInfluencer } from "@/client-side/widgets";
import {
  AdditionalPlatformForm,
  PlatformForm,
} from "@/client-side/client-forms";
import { groupPlatforms } from "@/client-side/utils";

const MAIN_NETWORKS = ["facebook", "instagram", "youtube", "tiktok"];
const MUSIC_NETWORKS = ["spotify", "soundcloud"];
export type GroupKey = "main" | "music" | "press";
const getGroupBySocial = (social: string): GroupKey => {
  const s = String(social || "").toLowerCase();
  if (MAIN_NETWORKS.includes(s)) return "main";
  if (MUSIC_NETWORKS.includes(s)) return "music";
  return "press";
};

const getGroupsFromContent = (content: any[]): Set<GroupKey> => {
  return new Set(
    (content ?? []).map((c) => c?.socialMediaGroup as GroupKey).filter(Boolean),
  );
};

const getGroupsFromPromo = (promoCard: any[]): Set<GroupKey> => {
  return new Set(
    (promoCard ?? []).map((a) => getGroupBySocial(a?.socialMedia)),
  );
};

const pickPlatformsForGroup = (promoCard: any[], group: GroupKey): string[] => {
  const set = new Set<string>();
  (promoCard ?? []).forEach((a) => {
    const sm = String(a?.socialMedia || "").toLowerCase();
    if (!sm) return;
    if (getGroupBySocial(sm) !== group) return;
    set.add(sm);
  });
  return Array.from(set);
};

export const PostContentAdd: React.FC = () => {
  const [selectedEntity, setSelectedEntity] = React.useState(0);
  const navigate = useNavigate();
  const [sp] = useSearchParams();

  const optionIndex = Number(sp.get("option") ?? 0);

  const promoCard = useSelectCampaignProposal((s) => s.promoCard);
  const totalPrice = useSelectCampaignProposal((s) => s.totalPrice);
  const actions = useSelectCampaignProposal((s) => s.actions);
  const postContentDraft = useSelectCampaignProposal((s) => s.postContentDraft);

  const proposalContent = useProposalAccountsStore(
    (s) => s.contentByOption?.[optionIndex] ?? [],
  );

  const existingGroups = React.useMemo(
    () => getGroupsFromContent(proposalContent),
    [proposalContent],
  );

  const requiredGroups = React.useMemo(
    () => getGroupsFromPromo(promoCard),
    [promoCard],
  );

  const missingGroups = React.useMemo(() => {
    const res: GroupKey[] = [];
    requiredGroups.forEach((g) => {
      if (!existingGroups.has(g)) res.push(g);
    });
    return res;
  }, [existingGroups, requiredGroups]);

  const selectedPlatforms = React.useMemo(() => {
    const all: string[] = [];
    missingGroups.forEach((g) => {
      all.push(...pickPlatformsForGroup(promoCard, g));
    });
    return Array.from(new Set(all));
  }, [missingGroups, promoCard]);

  const grouped = React.useMemo(
    () => groupPlatforms(selectedPlatforms),
    [selectedPlatforms],
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
      (missingGroups as GroupKey[]).forEach((group) => {
        const platforms = grouped[group] as string[] | undefined;
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

      const { campaignContent, promoCard } =
        useSelectCampaignProposal.getState();

      useProposalAccountsStore
        .getState()
        .mergeContent(optionIndex, campaignContent);

      useProposalAccountsStore.getState().addAccounts(optionIndex, promoCard);

      actions.clearPromoCards();

      navigate("/client/campaign");
    },
    [actions, grouped, navigate, selectedPlatforms, missingGroups, optionIndex],
  );

  const renderGroup = (group: GroupKey) => {
    if (!missingGroups.includes(group)) return null;

    const platforms = (grouped[group] ?? []) as SocialMediaType[];
    if (!platforms.length) return null;

    const baseForm = platformFormsMap[group];
    const additional = groupAdditionalByGroup[group];

    return (
      <div key={group} className="platform-group">
        <PlatformForm
          selectedEntity={selectedEntity}
          data={baseForm}
          selectedPlatforms={platforms}
          formPrefix={`${group}-0`}
        />

        {additional.map((f) => {
          const n = getAdditionalIndex(f.id);

          return (
            <AdditionalPlatformForm
              selectedEntity={selectedEntity}
              key={f.id}
              data={{
                ...baseForm,
                _id: f.id,
                platform: group,
                socialMedia: f.socialMedia,
              }}
              index={n - 1}
              formPrefix={getFormPrefix(f)}
            />
          );
        })}

        <ButtonSecondary
          className="additional-button"
          text={`Add additional ${baseForm.contentTitle}`}
          onClick={() => toggleAdditionalSelection(group)}
        />

        <div className="people-chose">
          <ButtonSecondary
            className={`for-class ${selectedEntity === 0 ? "active" : ""}`}
            text="For creators"
            onClick={() => setSelectedEntity(0)}
          />
          <ButtonSecondary
            className={`for-class ${selectedEntity === 1 ? "active" : ""}`}
            text="For communities"
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
        )}
      </div>
    );
  };

  React.useEffect(() => {
    if (missingGroups.length === 0) {
      navigate("/client/campaign");
    }
  }, [missingGroups.length, navigate]);

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
              {renderGroup("main")}
              {renderGroup("music")}
              {renderGroup("press")}
            </Form>
          </div>
        </div>

        <SelectionAddInfluencer promoCard={promoCard} totalPrice={totalPrice} />
      </div>
    </Container>
  );
};
