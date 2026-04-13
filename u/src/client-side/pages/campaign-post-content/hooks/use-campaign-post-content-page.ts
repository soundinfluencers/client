import React from "react";
import { useNavigate } from "react-router-dom";
import { useCampaignStore } from "@/client-side/store";
import { useSelectedPlatforms } from "@/client-side/hooks";
import { useAdditionalForms } from "@/client-side/hooks"
import {groupPlatforms} from "@/client-side/utils";

export const useCampaignPostContentPage = () => {
    const navigate = useNavigate();
    const store = useCampaignStore();
    const actions = useCampaignStore((s) => s.actions);

    const offer = useCampaignStore((s) => s.offer);
    const promoCard = useCampaignStore((s) => s.promoCard);
    const totalPrice = useCampaignStore((s) => s.totalPrice);
    const postContentDraft = useCampaignStore((s) => s.postContentDraft);

    const selectedPlatforms = useSelectedPlatforms(offer, promoCard);

    const grouped = React.useMemo(
        () => groupPlatforms(selectedPlatforms),
        [selectedPlatforms],
    );

    const saveDraftFormValues = React.useCallback(
        (values: Partial<Record<string, string>>) => {
            console.log("ON_VALUES_CHANGE", values);

            actions.setPostContentDraft(values as Record<string, string>);

            if (values.campaignName !== undefined) {
                actions.setCampaignName(values.campaignName);
            }
        },
        [actions],
    );
    const pageTitle = React.useMemo(() => {
        const hasMain = grouped.main.length > 0;
        const hasMusic = grouped.music.length > 0;
        const hasPress = grouped.press.length > 0;

        if (hasMain && !hasMusic && !hasPress) return "Post this content";
        if (!hasMain && hasMusic && !hasPress) return "Submit this content";
        if (!hasMain && !hasMusic && hasPress) return "Review this content";

        return "Review your campaign content";
    }, [grouped]);
    const additionalForms = useAdditionalForms(
        postContentDraft ?? undefined,
        actions.setPostContentDraft,
    );
    const handleSubmit = React.useCallback(
        (formData: Record<string, string>) => {
            if (formData.campaignName) {
                actions.setCampaignName(formData.campaignName);
            }

            actions.setPostContentDraft(formData);

            actions.buildCampaignContentAndSyncAccounts(
                formData,
                selectedPlatforms,
                grouped,
            );

            navigate("/client/create-campaign/content/strategy");
        },
        [actions, grouped, navigate, selectedPlatforms],
    );
    // const handleSubmit = React.useCallback(
    //     (formData: Record<string, string>) => {
    //         if (formData.campaignName) {
    //             actions.setCampaignName(formData.campaignName);
    //         }
    //
    //         (["main", "music", "press"] as const).forEach((group) => {
    //             const platforms = grouped[group];
    //             if (!platforms?.length) return;
    //
    //             platforms.forEach((platform) => {
    //                 actions.addPostContent(group, formData, platform);
    //             });
    //         });
    //         console.log(formData,'[][][');
    //         actions.setPostContentDraft(formData);
    //         actions.buildCampaignContentFromForm(
    //             formData,
    //             selectedPlatforms,
    //             grouped,
    //         );
    //
    //         navigate("/client/create-campaign/content/strategy");
    //     },
    //     [actions, grouped, navigate, selectedPlatforms],
    // );

    return {
        store,
        actions,
        offer,
        promoCard,
        totalPrice,
        postContentDraft,
        selectedPlatforms,
        grouped,
        saveDraftFormValues,
        handleSubmit,
        pageTitle,
        ...additionalForms,
    };
};