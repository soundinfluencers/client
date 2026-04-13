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

import type { TableRowProps } from "@/client-side/types/table-types";
import { DateCell } from "../cells/strategy/date-cell";
import { getAccountKey } from "@/client-side/utils";
import { useDraftCampaignStore } from "@/client-side/store";
import { ContentCellEditDraft } from "../cells/editable-cells/content-edit-cell-draft";

const MAIN_NETWORKS = ["facebook", "instagram", "youtube", "tiktok"];
const MUSIC_NETWORKS = ["spotify", "soundcloud"];

export const getGroupBySocial = (
    social: string,
): "main" | "music" | "press" => {
    const s = social.toLowerCase();

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
                                                       }: TableRowProps) {
    const accountKey = getAccountKey(data);

    const draftAccount = useDraftCampaignStore((s) => {
        const list = s.accountsByCampaignId[campaignId ?? ""] ?? [];

        return list.find(
            (item: any) =>
                String(
                    item?.addedAccountsId ??
                    item?.socialAccountId ??
                    item?.accountId ??
                    item?._id ??
                    "",
                ) === accountKey,
        );
    });

    const setAccountDateRequest = useDraftCampaignStore(
        (s) => s.setAccountDateRequest,
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
            (it) => String(it.socialMedia ?? "").toLowerCase() === social,
        );

        if (socialItems.length) return socialItems;

        const socialGroup = getGroupBySocial(social);
        const groupItems = (items ?? []).filter(
            (it) => it.socialMediaGroup === socialGroup,
        );

        if (social === "instagram") return groupItems;
        if (socialGroup === "main") return groupItems.slice(0, 1);

        return groupItems;
    }, [items, data.socialMedia]);

    const selectedMeta =
        draftAccount?.selectedCampaignContentItem ??
        draftAccount?.selectedContent ??
        data?.selectedContent ??
        data?.selectedCampaignContentItem ??
        null;

    const selectedContentId = String(
        selectedMeta?.campaignContentItemId ?? "",
    );

    const selectedDescriptionId = String(
        selectedMeta?.descriptionId ?? "",
    );

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

    const [selectedContent, setSelectedContent] = React.useState<number>(
        resolvedSelectedContent,
    );
    const [selectedPd, setSelectedPd] = React.useState<number>(
        resolvedSelectedPd,
    );

    React.useEffect(() => {
        setSelectedContent(resolvedSelectedContent);
    }, [resolvedSelectedContent]);

    React.useEffect(() => {
        setSelectedPd(resolvedSelectedPd);
    }, [resolvedSelectedPd]);

    const safeSelectedContent =
        selectedContent >= 0 && selectedContent < platformItems.length
            ? selectedContent
            : 0;

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

    const dateRequestRaw = String(
        draftAccount?.dateRequest ?? data?.dateRequest ?? "ASAP",
    );
    const [mode, dateVal = ""] = dateRequestRaw.split(":");
    const setAccountSelectedContent = useDraftCampaignStore(
        (s) => s.setAccountSelectedContent,
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

                    {group !== "press" && (
                        <ContentCell
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
                    )}

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
                            />
                        )
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

                    {group !== "press" ? (
                        canEdit ? (
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
                            />
                        )
                    ) : null}

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
                            isOpen={isPostDescriptionOpen}
                            onToggle={togglePD}
                            onClose={onCloseDropdown}
                            platformItems={platformItems}
                            selectedContent={safeSelectedContent}
                            selectedPd={safeSelectedPd}
                            setSelectedPd={setSelectedPd}
                            group={group}
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