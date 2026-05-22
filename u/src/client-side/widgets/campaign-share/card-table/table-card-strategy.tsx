import React from "react";
import type { CampaignContentItem } from "@/types/store/index.types";
import type { TableRowProps } from "@/client-side/types/table-types";
import { ReqData } from "@/client-side/data/table-campaign.data";

import { NetworkCell } from "../cells/strategy/network-cell";
import { DateCell } from "../cells/strategy/date-cell";
import { FollowersCell } from "../cells/strategy/followers-cell";
import { ContentCell } from "../cells/strategy/content-cell";
import { DescriptionCell } from "../cells/strategy/description-cell";
import { ExtraFieldsCells } from "../cells/strategy/extra-fields-cells";
import { CountriesCell } from "../cells/strategy/countries-cell";
import { GenresCell } from "../cells/strategy/genres-cell";

const parseDateRequest = (value?: string | null) => {
    const raw = String(value ?? "").trim();

    if (raw.startsWith("BEFORE:")) {
        return {
            selectedDate: "BEFORE",
            customDate: raw.replace("BEFORE:", ""),
        };
    }

    if (raw.startsWith("AFTER:")) {
        return {
            selectedDate: "AFTER",
            customDate: raw.replace("AFTER:", ""),
        };
    }

    return {
        selectedDate: raw || ReqData[0],
        customDate: "",
    };
};

export const TableCard = React.memo(function TableCard({
                                                           data,
                                                           rowKey,
                                                           changeView,
                                                           group,
                                                           items,
                                                           activeDropdown,
                                                           onToggleDropdown,
                                                           onCloseDropdown,
                                                           columns,
                                                       }: TableRowProps) {
    const initialDateRequest = React.useMemo(
        () => parseDateRequest((data as any)?.dateRequest),
        [data],
    );

    const [selectedDate, setSelectedDate] = React.useState<string>(
        initialDateRequest.selectedDate,
    );

    const [customDate, setCustomDate] = React.useState<string>(
        initialDateRequest.customDate,
    );

    React.useEffect(() => {
        setSelectedDate(initialDateRequest.selectedDate);
        setCustomDate(initialDateRequest.customDate);
    }, [initialDateRequest.selectedDate, initialDateRequest.customDate]);

    const isDateOpen =
        activeDropdown?.rowKey === rowKey && activeDropdown.key === "date";

    const isContentOpen =
        activeDropdown?.rowKey === rowKey && activeDropdown.key === "content";

    const isPostDescriptionOpen =
        activeDropdown?.rowKey === rowKey &&
        activeDropdown.key === "postDescription";

    const itemsByPlatform = React.useMemo(() => {
        const map: Record<string, CampaignContentItem[]> = {};

        for (const item of items ?? []) {
            const key = String(item.socialMedia ?? "").trim().toLowerCase();

            if (!map[key]) {
                map[key] = [];
            }

            map[key].push(item);
        }

        return map;
    }, [items]);

    const platformItems = React.useMemo(() => {
        const key = String((data as any)?.socialMedia ?? "")
            .trim()
            .toLowerCase();

        return itemsByPlatform[key] ?? [];
    }, [itemsByPlatform, data]);

    const selectedMeta = React.useMemo(() => {
        const rawSelected =
            (data as any)?.selectedContent ??
            (data as any)?.selectedCampaignContentItem ??
            null;

        if (!rawSelected) return null;

        /**
         * Backend иногда присылает:
         * selectedContent: {
         *   campaignContentItemId,
         *   descriptionId
         * }
         *
         * А иногда:
         * selectedCampaignContentItem: {
         *   _id,
         *   description
         * }
         *
         * Поэтому нормализуем оба варианта.
         */
        return {
            campaignContentItemId:
                rawSelected.campaignContentItemId ?? rawSelected._id ?? "",
            descriptionId: rawSelected.descriptionId ?? "",
        };
    }, [data]);

    const selectedContentId = String(
        selectedMeta?.campaignContentItemId ?? "",
    );

    const selectedDescriptionId = String(
        selectedMeta?.descriptionId ?? "",
    );

    const resolvedSelectedContent = React.useMemo(() => {
        if (!platformItems.length) return 0;
        if (!selectedContentId) return 0;

        const index = platformItems.findIndex(
            (item: any) =>
                String(item?._id ?? item?.id ?? "") === selectedContentId,
        );

        return index >= 0 ? index : 0;
    }, [platformItems, selectedContentId]);

    const resolvedSelectedPd = React.useMemo(() => {
        const descriptions =
            platformItems?.[resolvedSelectedContent]?.descriptions ?? [];

        if (!descriptions.length) return 0;
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

    const safeSelectedContent = React.useMemo(() => {
        if (!platformItems.length) return 0;

        return selectedContent >= 0 && selectedContent < platformItems.length
            ? selectedContent
            : 0;
    }, [platformItems, selectedContent]);

    const safeSelectedPd = React.useMemo(() => {
        const descriptions =
            platformItems?.[safeSelectedContent]?.descriptions ?? [];

        if (!descriptions.length) return 0;

        return selectedPd >= 0 && selectedPd < descriptions.length
            ? selectedPd
            : 0;
    }, [platformItems, safeSelectedContent, selectedPd]);

    const toggleDate = React.useCallback(() => {
        onToggleDropdown(rowKey, "date");
    }, [onToggleDropdown, rowKey]);

    const toggleContent = React.useCallback(() => {
        onToggleDropdown(rowKey, "content");
    }, [onToggleDropdown, rowKey]);

    const togglePD = React.useCallback(() => {
        onToggleDropdown(rowKey, "postDescription");
    }, [onToggleDropdown, rowKey]);

    return (
        <tr className="table-campaign-page__tr">
            <NetworkCell data={data} />

            {columns?.includes("followers") && <FollowersCell data={data} />}

            {changeView ? (
                <>
                    {group !== "press" && (
                        <ContentCell
                            isOpen={isContentOpen}
                            onToggle={toggleContent}
                            onClose={onCloseDropdown}
                            platformItems={platformItems}
                            selectedContent={safeSelectedContent}
                            setSelectedContent={setSelectedContent}
                            setSelectedPd={setSelectedPd}
                            socialMedia={(data as any)?.socialMedia}
                            group={group}
                        />
                    )}

                    {group !== "press" && (
                        <DescriptionCell
                            group={group}
                            isOpen={isPostDescriptionOpen}
                            onToggle={togglePD}
                            onClose={onCloseDropdown}
                            platformItems={platformItems}
                            selectedContent={safeSelectedContent}
                            selectedPd={safeSelectedPd}
                            setSelectedPd={setSelectedPd}
                        />
                    )}

                    {group === "press" && (
                        <ExtraFieldsCells
                            changeView={changeView}
                            group={group}
                            platformItems={platformItems}
                            selectedContent={safeSelectedContent}
                        />
                    )}
                </>
            ) : (
                <>
                    <DateCell
                        canEdit={false}
                        isOpen={isDateOpen}
                        onToggle={toggleDate}
                        onClose={onCloseDropdown}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        customDate={customDate}
                        setCustomDate={setCustomDate}
                    />

                    {group !== "press" && (
                        <ContentCell
                            isOpen={isContentOpen}
                            onToggle={toggleContent}
                            onClose={onCloseDropdown}
                            platformItems={platformItems}
                            selectedContent={safeSelectedContent}
                            setSelectedContent={setSelectedContent}
                            setSelectedPd={setSelectedPd}
                            socialMedia={(data as any)?.socialMedia}
                            group={group}
                        />
                    )}

                    <DescriptionCell
                        isOpen={isPostDescriptionOpen}
                        group={group}
                        onToggle={togglePD}
                        onClose={onCloseDropdown}
                        platformItems={platformItems}
                        selectedContent={safeSelectedContent}
                        selectedPd={safeSelectedPd}
                        setSelectedPd={setSelectedPd}
                    />

                    <ExtraFieldsCells
                        changeView={changeView}
                        group={group}
                        platformItems={platformItems}
                        selectedContent={safeSelectedContent}
                    />
                </>
            )}

            {columns?.includes("genres") && <GenresCell data={data} />}
            {columns?.includes("countries") && <CountriesCell data={data} />}
        </tr>
    );
});