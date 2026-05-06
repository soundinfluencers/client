import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import {
    campaignPostContentFormSchema,
    type CampaignPostContentFormSchema,
} from "./campaign-post-content.schema";
import type {
    AdditionalMainTarget,
    BuiltCampaignPostContentPayload,
    CampaignPostContentAccount,
    CampaignPostContentBlock,
} from "./campaign-post-content.types";
import {
    addAdditionalMainBlock,
    addAdditionalMusicBlock,
    addDescriptionToBlock, buildBlocksFromCampaignContent,
    buildCampaignPostContentPayload,
    buildInitialBlocks,
    canAddAdditionalToMain,
    canAddAdditionalToMusic,
    getMainUiLabel,
    removeBlock,
    removeDescriptionFromBlock,
    syncBlocksWithAccounts,
    updateBlockFields,
    updateDescriptionInBlock,
} from "./campaign-post-content.helpers";
import { useCampaignBuilderStore } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store";

type Params = {
    accounts: CampaignPostContentAccount[];
    campaignName?: string;
    campaignPrice: number;
    defaultBlocks?: CampaignPostContentBlock[];
    defaultCampaignContent?: BuiltCampaignPostContentPayload["campaignContent"];
};

export const useCampaignPostContent = ({
                                           accounts,
                                           campaignName = "",
                                           campaignPrice,
                                           defaultBlocks,
                                           defaultCampaignContent
                                       }: Params) => {
    const setCampaignName = useCampaignBuilderStore((s) => s.actions.setCampaignName);
    const setPostContentDraft = useCampaignBuilderStore(
        (s) => s.actions.setPostContentDraft,
    );
    const setBlocksDraft = useCampaignBuilderStore((s) => s.actions.setBlocksDraft);
    const setCampaignContent = useCampaignBuilderStore(
        (s) => s.actions.setCampaignContent,
    );

    const initialBlocks = React.useMemo(() => {
        let baseBlocks: CampaignPostContentBlock[] = [];

        if (defaultBlocks?.length) {
            baseBlocks = defaultBlocks;
        } else if (defaultCampaignContent?.length) {
            baseBlocks = buildBlocksFromCampaignContent({
                accounts,
                campaignContent: defaultCampaignContent,
            });
        } else {
            baseBlocks = buildInitialBlocks(accounts);
        }

        return syncBlocksWithAccounts({
            accounts,
            blocks: baseBlocks,
        });
    }, [accounts, defaultBlocks, defaultCampaignContent]);
    const form = useForm<CampaignPostContentFormSchema>({
        resolver: zodResolver(campaignPostContentFormSchema),
        defaultValues: {
            campaignName,
            blocks: initialBlocks,
        },
        mode: "onSubmit",
        reValidateMode: "onChange",
    });

    const blocks =
        useWatch({
            control: form.control,
            name: "blocks",
        }) ?? [];

    const syncedOnceRef = React.useRef(false);
    const lastAccountsKeyRef = React.useRef("");

    React.useEffect(() => {
        const accountsKey = JSON.stringify(
            accounts.map((item) => ({
                accountId: item.accountId,
                socialMedia: item.socialMedia,
                profileType: item.profileType,
            })),
        );

        const currentBlocks =
            (form.getValues("blocks") as CampaignPostContentBlock[] | undefined) ?? [];

        const baseBlocks =
            currentBlocks.length > 0
                ? currentBlocks
                : defaultBlocks?.length
                    ? defaultBlocks
                    : buildInitialBlocks(accounts);

        const nextBlocks = syncBlocksWithAccounts({
            accounts,
            blocks: baseBlocks,
        });

        const currentSerialized = JSON.stringify(currentBlocks);
        const nextSerialized = JSON.stringify(nextBlocks);

        const accountsChanged = lastAccountsKeyRef.current !== accountsKey;
        const shouldInit = !syncedOnceRef.current || accountsChanged;

        if (shouldInit && currentSerialized !== nextSerialized) {
            form.setValue("blocks", nextBlocks, {
                shouldDirty: false,
                shouldTouch: false,
                shouldValidate: false,
            });
        }

        syncedOnceRef.current = true;
        lastAccountsKeyRef.current = accountsKey;
    }, [accounts, defaultBlocks, form]);

    const [mainChoiceOpen, setMainChoiceOpen] = React.useState(false);
    const [musicChoiceOpen, setMusicChoiceOpen] = React.useState(false);

    const mainUiLabel = React.useMemo(() => getMainUiLabel(accounts), [accounts]);

    const mainAddConfig = React.useMemo(
        () => canAddAdditionalToMain(accounts),
        [accounts],
    );

    const musicAddConfig = React.useMemo(
        () => canAddAdditionalToMusic(accounts),
        [accounts],
    );

    const updateBlocks = React.useCallback(
        (nextBlocks: CampaignPostContentBlock[], validate = false) => {
            form.setValue("blocks", nextBlocks, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: validate,
            });
        },
        [form],
    );

    const onAddMainAdditional = React.useCallback(() => {
        if (!mainAddConfig.mustChoose && mainAddConfig.directAudience) {
            const currentBlocks = form.getValues("blocks") ?? [];

            updateBlocks(
                addAdditionalMainBlock(currentBlocks, mainAddConfig.directAudience),
                true,
            );
            return;
        }

        setMainChoiceOpen((prev) => !prev);
    }, [form, mainAddConfig, updateBlocks]);

    const onChooseMainAdditional = React.useCallback(
        (audience: AdditionalMainTarget) => {
            const currentBlocks = form.getValues("blocks") ?? [];

            updateBlocks(addAdditionalMainBlock(currentBlocks, audience), true);
            setMainChoiceOpen(false);
        },
        [form, updateBlocks],
    );

    const onAddMusicAdditional = React.useCallback(() => {
        if (!musicAddConfig.mustChoose && musicAddConfig.directPlatform) {
            const currentBlocks = form.getValues("blocks") ?? [];

            updateBlocks(
                addAdditionalMusicBlock(
                    currentBlocks,
                    musicAddConfig.directPlatform,
                ),
                true,
            );
            return;
        }

        setMusicChoiceOpen((prev) => !prev);
    }, [form, musicAddConfig, updateBlocks]);

    const onChooseMusicAdditional = React.useCallback(
        (platform: string) => {
            const currentBlocks = form.getValues("blocks") ?? [];

            updateBlocks(addAdditionalMusicBlock(currentBlocks, platform), true);
            setMusicChoiceOpen(false);
        },
        [form, updateBlocks],
    );

    const onRemoveBlock = React.useCallback(
        (blockId: string) => {
            const currentBlocks = form.getValues("blocks") ?? [];
            updateBlocks(removeBlock(currentBlocks, blockId), true);
            void form.trigger("blocks");
        },
        [form, updateBlocks],
    );

    const onChangeField = React.useCallback(
        (
            blockId: string,
            field: "mainLink" | "taggedUser" | "taggedLink" | "additionalBrief",
            value: string,
        ) => {
            const currentBlocks = form.getValues("blocks") ?? [];
            const block = currentBlocks.find((item) => item.id === blockId);
            if (!block) return;

            updateBlocks(
                updateBlockFields(currentBlocks, blockId, {
                    ...block.fields,
                    [field]: value,
                }),
                true,
            );
        },
        [form, updateBlocks],
    );

    const onAddDescription = React.useCallback(
        (blockId: string) => {
            const currentBlocks = form.getValues("blocks") ?? [];
            updateBlocks(addDescriptionToBlock(currentBlocks, blockId), true);
        },
        [form, updateBlocks],
    );

    const onRemoveDescription = React.useCallback(
        (blockId: string, descriptionId: string) => {
            const currentBlocks = form.getValues("blocks") ?? [];
            updateBlocks(
                removeDescriptionFromBlock(currentBlocks, blockId, descriptionId),
                true,
            );
            void form.trigger("blocks");
        },
        [form, updateBlocks],
    );

    const onChangeDescription = React.useCallback(
        (blockId: string, descriptionId: string, value: string) => {
            const currentBlocks = form.getValues("blocks") ?? [];
            updateBlocks(
                updateDescriptionInBlock(
                    currentBlocks,
                    blockId,
                    descriptionId,
                    value,
                ),
                true,
            );
        },
        [form, updateBlocks],
    );

    const buildPayload = React.useCallback((): BuiltCampaignPostContentPayload => {
        const data = form.getValues();

        const payload = buildCampaignPostContentPayload({
            campaignName: data.campaignName,
            campaignPrice,
            accounts,
            blocks: data.blocks,
        });

        setCampaignContent(payload.campaignContent);

        return payload;
    }, [accounts, campaignPrice, form, setCampaignContent]);

    React.useEffect(() => {
        const subscription = form.watch((values) => {
            setCampaignName(values.campaignName ?? "");
            setPostContentDraft(values as Record<string, unknown>);
            setBlocksDraft(
                (values.blocks as CampaignPostContentBlock[] | undefined) ?? null,
            );
        });

        return () => subscription.unsubscribe();
    }, [form, setCampaignName, setPostContentDraft, setBlocksDraft]);

    return {
        form,
        blocks,
        mainUiLabel,

        mainChoiceOpen,
        setMainChoiceOpen,
        musicChoiceOpen,
        setMusicChoiceOpen,

        mainAddConfig,
        musicAddConfig,

        onAddMainAdditional,
        onChooseMainAdditional,
        onAddMusicAdditional,
        onChooseMusicAdditional,

        onRemoveBlock,
        onChangeField,
        onAddDescription,
        onRemoveDescription,
        onChangeDescription,

        buildPayload,
    };
};