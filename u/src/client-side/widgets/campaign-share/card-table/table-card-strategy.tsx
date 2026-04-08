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
    const [selectedDate, setSelectedDate] = React.useState<string>(ReqData[0]);
    const [selectedContent, setSelectedContent] = React.useState<number>(0);
    const [selectedPd, setSelectedPd] = React.useState<number>(0);
    const [customDate, setCustomDate] = React.useState<string>("");

    const isDateOpen =
        activeDropdown?.rowKey === rowKey && activeDropdown.key === "date";
    const isContentOpen =
        activeDropdown?.rowKey === rowKey && activeDropdown.key === "content";
    const isPostDescriptionOpen =
        activeDropdown?.rowKey === rowKey &&
        activeDropdown.key === "postDescription";

    const itemsByPlatform = React.useMemo(() => {
        const map: Record<string, CampaignContentItem[]> = {};

        for (const it of items ?? []) {
            const key = String(it.socialMedia ?? "")
                .trim()
                .toLowerCase();

            (map[key] ||= []).push(it);
        }

        return map;
    }, [items]);

    const platformItems = React.useMemo(() => {
        const key = String(data.socialMedia ?? "")
            .trim()
            .toLowerCase();

        return itemsByPlatform[key] ?? [];
    }, [itemsByPlatform, data.socialMedia]);

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

            {columns?.includes("followers") && <FollowersCell data={data} />}

            {changeView ? (
                <>
                    {group !== "press" && (
                        <ContentCell
                            isOpen={isContentOpen}
                            onToggle={toggleContent}
                            onClose={onCloseDropdown}
                            platformItems={platformItems}
                            selectedContent={selectedContent}
                            setSelectedContent={setSelectedContent}
                            setSelectedPd={setSelectedPd}
                            socialMedia={data.socialMedia}
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
                            selectedContent={selectedContent}
                            selectedPd={selectedPd}
                            setSelectedPd={setSelectedPd}
                        />
                    )}

                    {group === "press" && (
                        <ExtraFieldsCells
                            changeView={changeView}
                            group={group}
                            platformItems={platformItems}
                            selectedContent={selectedContent}
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
                            selectedContent={selectedContent}
                            setSelectedContent={setSelectedContent}
                            setSelectedPd={setSelectedPd}
                            socialMedia={data.socialMedia}
                            group={group}
                        />
                    )}

                    <DescriptionCell
                        group={group}
                        isOpen={isPostDescriptionOpen}
                        onToggle={togglePD}
                        onClose={onCloseDropdown}
                        platformItems={platformItems}
                        selectedContent={selectedContent}
                        selectedPd={selectedPd}
                        setSelectedPd={setSelectedPd}
                    />

                    <ExtraFieldsCells
                        changeView={changeView}
                        group={group}
                        platformItems={platformItems}
                        selectedContent={selectedContent}
                    />
                </>
            )}

            {columns?.includes("genres") && <GenresCell data={data} />}
            {columns?.includes("countries") && <CountriesCell data={data} />}
        </tr>
    );
});