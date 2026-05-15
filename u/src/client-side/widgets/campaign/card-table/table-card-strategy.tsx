import React from "react";

import { NetworkCell } from "../cells/strategy/network-cell";
import { FollowersCell } from "../cells/strategy/followers-cell";
import { ContentCell } from "../cells/strategy/content-cell";
import { DescriptionCell } from "../cells/strategy/description-cell";
import { ExtraFieldsCells } from "../cells/strategy/extra-fields-cells";
import { DescriptionCellEdit } from "../cells/editable-cells/descritpion-edit-cell";
import { ExtraFieldsCellsEdit } from "../cells/editable-cells/extra-edit-cell";
import { CountriesCell } from "../cells/strategy/countries-cell";
import { GenresCell } from "../cells/strategy/genres-cell";
import { DateCell } from "../cells/strategy/date-cell";
import { ContentCellEditDraft } from "../cells/editable-cells/content-edit-cell-draft";

import type { TableRowProps } from "@/client-side/types/table-types";
import { getAccountKey } from "@/client-side/utils";
import { useStrategyCampaignStore } from "@/client-side/store";

const MAIN_NETWORKS = ["facebook", "instagram", "youtube", "tiktok"];
const MUSIC_NETWORKS = ["spotify", "soundcloud"];

export const getGroupBySocial = (
    social: string,
): "main" | "music" | "press" => {
    const s = String(social ?? "").toLowerCase();

    if (MAIN_NETWORKS.includes(s)) return "main";
    if (MUSIC_NETWORKS.includes(s)) return "music";
    return "press";
};

export const TableCard = React.memo(function TableCard({
                                                           data,
                                                           rowKey,
                                                           changeView,
                                                           group,
                                                           items,
                                                           activeDropdown,
                                                           onToggleDropdown,
                                                           canEdit,
                                                           onCloseDropdown,
                                                           campaignId,
                                                           columns,
                                                           status
                                                       }: TableRowProps) {
    const accountKey = getAccountKey(data);

    const strategyAccount = useStrategyCampaignStore((s: any) => {
        const list = s.accountsByCampaignId?.[campaignId ?? ""] ?? [];
        return list.find(
            (item: any) =>
                String(
                    item?.addedAccountsId ??
                    item?.socialAccountId ??
                    item?.accountId ??
                    item?._id ??
                    "",
                ) === String(accountKey),
        );
    });

    const setAccountDateRequest = useStrategyCampaignStore(
        (s: any) => s.setAccountDateRequest,
    );

    const setAccountSelectedContent = useStrategyCampaignStore(
        (s: any) => s.setAccountSelectedContent,
    );

    const isDateOpen =
        activeDropdown?.rowKey === rowKey && activeDropdown.key === "date";
    const isContentOpen =
        activeDropdown?.rowKey === rowKey && activeDropdown.key === "content";
    const isPostDescriptionOpen =
        activeDropdown?.rowKey === rowKey &&
        activeDropdown.key === "postDescription";

    const platformItems = React.useMemo(() => {
        const social = String(data.socialMedia ?? "").toLowerCase();

        const socialItems = (items ?? []).filter(
            (it: any) => String(it.socialMedia ?? "").toLowerCase() === social,
        );
        if (socialItems.length) return socialItems;

        const socialGroup = getGroupBySocial(social);
        const groupItems = (items ?? []).filter(
            (it: any) => String(it.socialMediaGroup ?? "") === socialGroup,
        );

        if (social === "instagram") return groupItems;
        if (socialGroup === "main") return groupItems.slice(0, 1);

        return groupItems;
    }, [items, data.socialMedia]);

    const selectedMeta =
        strategyAccount?.selectedCampaignContentItem ??
        strategyAccount?.selectedContent ??
        data?.selectedCampaignContentItem ??
        data?.selectedContent ??
        null;

    const selectedContentId = String(selectedMeta?.campaignContentItemId ?? "");
    const selectedDescriptionId = String(selectedMeta?.descriptionId ?? "");

    const resolvedSelectedContent = React.useMemo(() => {
        if (!selectedContentId) return 0;

        const index = platformItems.findIndex(
            (item: any) => String(item?._id ?? item?.id ?? "") === selectedContentId,
        );

        return index >= 0 ? index : 0;
    }, [platformItems, selectedContentId]);

    const resolvedSelectedPd = React.useMemo(() => {
        const descriptions =
            platformItems?.[resolvedSelectedContent]?.descriptions ?? [];

        if (!selectedDescriptionId) return 0;

        const index = descriptions.findIndex(
            (desc: any) => String(desc?._id ?? "") === selectedDescriptionId,
        );

        return index >= 0 ? index : 0;
    }, [platformItems, resolvedSelectedContent, selectedDescriptionId]);

    const [selectedContent, setSelectedContentState] = React.useState<number>(
        resolvedSelectedContent,
    );

    const [pdByContentId, setPdByContentId] = React.useState<Record<string, number>>(
        () => {
            const initialItem = platformItems?.[resolvedSelectedContent];
            const initialContentId = String(initialItem?._id ?? "");
            if (!initialContentId) return {};
            return { [initialContentId]: resolvedSelectedPd };
        },
    );

    React.useEffect(() => {
        setSelectedContentState(resolvedSelectedContent);

        const item = platformItems?.[resolvedSelectedContent];
        const contentId = String(item?._id ?? "");
        if (!contentId) return;

        setPdByContentId((prev) => {
            if (prev[contentId] === resolvedSelectedPd) return prev;
            return {
                ...prev,
                [contentId]: resolvedSelectedPd,
            };
        });
    }, [resolvedSelectedContent, resolvedSelectedPd, platformItems]);

    const safeSelectedContent =
        selectedContent >= 0 && selectedContent < platformItems.length
            ? selectedContent
            : 0;

    const currentContentId = String(
        platformItems?.[safeSelectedContent]?._id ?? "",
    );

    const selectedPd = pdByContentId[currentContentId] ?? 0;

    const safeSelectedPd = React.useMemo(() => {
        const descriptions =
            platformItems?.[safeSelectedContent]?.descriptions ?? [];

        if (!descriptions.length) return 0;
        if (selectedPd < 0 || selectedPd >= descriptions.length) return 0;

        return selectedPd;
    }, [platformItems, safeSelectedContent, selectedPd]);

    const selectedItem = platformItems?.[safeSelectedContent];
    const contentId = selectedItem?._id;
    const media0 = selectedItem?.mediaCache?.items?.[0];

    const syncSelectedToAccount = React.useCallback(
        (contentIndex: number, pdIndex: number) => {
            const nextItem = platformItems?.[contentIndex];
            const nextDesc = nextItem?.descriptions?.[pdIndex];

            if (!setAccountSelectedContent) return;

            setAccountSelectedContent(campaignId ?? "", accountKey, {
                campaignContentItemId: String(nextItem?._id ?? ""),
                descriptionId: String(nextDesc?._id ?? ""),
            });
        },
        [platformItems, setAccountSelectedContent, campaignId, accountKey],
    );

    const setSelectedContent = React.useCallback(
        (value: React.SetStateAction<number>) => {
            setSelectedContentState((prevContent) => {
                const nextContent =
                    typeof value === "function" ? value(prevContent) : value;

                const nextItem = platformItems?.[nextContent];
                const nextContentId = String(nextItem?._id ?? "");
                const nextDescriptions = nextItem?.descriptions ?? [];

                const rememberedPd = pdByContentId[nextContentId] ?? 0;
                const resolvedPd =
                    nextDescriptions.length && rememberedPd < nextDescriptions.length
                        ? rememberedPd
                        : 0;

                syncSelectedToAccount(nextContent, resolvedPd);

                return nextContent;
            });
        },
        [platformItems, pdByContentId, syncSelectedToAccount],
    );

    const setSelectedPd = React.useCallback(
        (value: React.SetStateAction<number>) => {
            const contentIndex = safeSelectedContent;
            const item = platformItems?.[contentIndex];
            const itemId = String(item?._id ?? "");

            setPdByContentId((prev) => {
                const prevPd = prev[itemId] ?? 0;
                const nextPd = typeof value === "function" ? value(prevPd) : value;

                syncSelectedToAccount(contentIndex, nextPd);

                return {
                    ...prev,
                    [itemId]: nextPd,
                };
            });
        },
        [platformItems, safeSelectedContent, syncSelectedToAccount],
    );

    const handleSelectDescriptionId = React.useCallback(
        (descriptionId: string) => {
            if (!setAccountSelectedContent) return;

            setAccountSelectedContent(campaignId ?? "", accountKey, {
                campaignContentItemId: String(selectedItem?._id ?? ""),
                descriptionId: String(descriptionId ?? ""),
            });
        },
        [setAccountSelectedContent, campaignId, accountKey, selectedItem],
    );

    const dateRequestRaw = String(
        strategyAccount?.dateRequest ?? data?.dateRequest ?? "ASAP",
    );
    const [mode, dateVal = ""] = dateRequestRaw.split(":");

    const toggleDate = React.useCallback(
        () => onToggleDropdown(rowKey, "date"),
        [onToggleDropdown, rowKey],
    );

    const toggleContent = React.useCallback(
        () => onToggleDropdown(rowKey, "content"),
        [onToggleDropdown, rowKey],
    );

    const togglePD = React.useCallback(
        () => onToggleDropdown(rowKey, "postDescription"),
        [onToggleDropdown, rowKey],
    );

    return (
        <tr className="table-campaign-page__tr">
            <NetworkCell data={data} />
            {columns.includes("followers") && <FollowersCell data={data} />}

            {changeView ? (
                <>
                    {canEdit ? (
                        <ExtraFieldsCellsEdit
                            changeView={changeView}
                            contentId={contentId}
                            baseItem={selectedItem}
                            group={group}
                        />
                    ) : (
                        <ExtraFieldsCells
                            changeView={changeView}
                            group={group}
                            platformItems={platformItems}
                            selectedContent={safeSelectedContent}
                        />
                    )}

                    {group !== "press" &&
                        (canEdit ? (
                            <ContentCellEditDraft
                                campaignId={campaignId ?? ""}
                                selectedItem={selectedItem}
                                isOpen={isContentOpen}
                                onToggle={toggleContent}
                                onClose={onCloseDropdown}
                                platformItems={platformItems}
                                selectedContent={safeSelectedContent}
                                setSelectedContent={setSelectedContent}
                                setSelectedPd={setSelectedPd}
                                socialMedia={data.socialMedia}
                                group={group}
                            />
                        ) : (
                            <ContentCell
                                media0={media0}
                                isOpen={isContentOpen}
                                onToggle={toggleContent}
                                onClose={onCloseDropdown}
                                platformItems={platformItems}
                                selectedContent={safeSelectedContent}
                                setSelectedContent={setSelectedContent}
                                setSelectedPd={setSelectedPd}
                                socialMedia={data.socialMedia}
                                group={group}
                                status={status}
                            />
                        ))}

                    {group !== "press" ? (
                        canEdit ? (
                            <DescriptionCellEdit
                                onSelectDescriptionId={handleSelectDescriptionId}
                                isOpen={isPostDescriptionOpen}
                                onToggle={togglePD}
                                onClose={onCloseDropdown}
                                platformItems={platformItems}
                                selectedContent={safeSelectedContent}
                                selectedPd={safeSelectedPd}
                                setSelectedPd={setSelectedPd}
                                group={group}
                            />
                        ) : (
                            <DescriptionCell
                                isOpen={isPostDescriptionOpen}
                                onToggle={togglePD}
                                onClose={onCloseDropdown}
                                platformItems={platformItems}
                                selectedContent={safeSelectedContent}
                                selectedPd={safeSelectedPd}
                                setSelectedPd={setSelectedPd}
                                group={group}
                                status={status}
                            />
                        )
                    ) : canEdit ? (
                        <ExtraFieldsCellsEdit
                            changeView={changeView}
                            contentId={contentId}
                            baseItem={selectedItem}
                            group={group}
                        />
                    ) : null}
                </>
            ) : (
                <>
                    <DateCell
                        isOpen={isDateOpen}
                        onToggle={toggleDate}
                        onClose={onCloseDropdown}
                        canEdit={canEdit}
                        selectedDate={mode}
                        customDate={dateVal}
                        setSelectedDate={(nextMode) => {
                            if (nextMode === "BEFORE" || nextMode === "AFTER") {
                                const next = dateVal ? `${nextMode}:${dateVal}` : nextMode;
                                setAccountDateRequest(campaignId ?? "", accountKey, next);
                            } else {
                                setAccountDateRequest(campaignId ?? "", accountKey, nextMode);
                            }
                        }}
                        setCustomDate={(nextDate) => {
                            const m = mode === "BEFORE" || mode === "AFTER" ? mode : "BEFORE";
                            setAccountDateRequest(
                                campaignId ?? "",
                                accountKey,
                                `${m}:${nextDate}`,
                            );
                        }}
                    />

                    {group !== "press" &&
                        (canEdit ? (
                            <ContentCellEditDraft
                                campaignId={campaignId ?? ""}
                                selectedItem={selectedItem}
                                isOpen={isContentOpen}
                                onToggle={toggleContent}
                                onClose={onCloseDropdown}
                                platformItems={platformItems}
                                selectedContent={safeSelectedContent}
                                setSelectedContent={setSelectedContent}
                                setSelectedPd={setSelectedPd}
                                socialMedia={data.socialMedia}
                                group={group}
                            />
                        ) : (
                            <ContentCell
                                media0={media0}
                                isOpen={isContentOpen}
                                onToggle={toggleContent}
                                onClose={onCloseDropdown}
                                platformItems={platformItems}
                                selectedContent={safeSelectedContent}
                                setSelectedContent={setSelectedContent}
                                setSelectedPd={setSelectedPd}
                                socialMedia={data.socialMedia}
                                group={group}
                                status={status}
                            />
                        ))}

                    {canEdit ? (
                        <DescriptionCellEdit
                            onSelectDescriptionId={handleSelectDescriptionId}
                            isOpen={isPostDescriptionOpen}
                            onToggle={togglePD}
                            onClose={onCloseDropdown}
                            platformItems={platformItems}
                            selectedContent={safeSelectedContent}
                            selectedPd={safeSelectedPd}
                            setSelectedPd={setSelectedPd}
                            group={group}
                        />
                    ) : (
                        <DescriptionCell
                            isOpen={activeDropdown?.rowKey === rowKey && activeDropdown?.key === "postDescription"}
                            onToggle={() => onToggleDropdown(rowKey, "postDescription")}
                            onClose={onCloseDropdown}
                            platformItems={platformItems}
                            selectedContent={selectedContent}
                            selectedPd={selectedPd}
                            setSelectedPd={setSelectedPd}
                            group={group}
                            status={status}
                            canEdit={canEdit}
                        />
                    )}

                    {canEdit ? (
                        <ExtraFieldsCellsEdit
                            contentId={contentId}
                            baseItem={selectedItem}
                            group={group}
                        />
                    ) : (
                        <ExtraFieldsCells
                            group={group}
                            platformItems={platformItems}
                            selectedContent={safeSelectedContent}
                        />
                    )}
                </>
            )}

            {columns.includes("genres") && <GenresCell data={data} />}
            {columns.includes("countries") && <CountriesCell data={data} />}
        </tr>
    );
});