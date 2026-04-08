import React from "react";
import { getColumns } from "@/client-side/utils";
import { useFollowersSort } from "@/client-side/hooks";
import type {
    ActiveDropdown,
    DropKey,
    TableGroup,
} from "../types/table-strategy.types";
import type { ConnectedAccount } from "@/client-side/types/offers";

type Params = {
    changeView: boolean;
    group: TableGroup;
    networks: ConnectedAccount[];
};

export const useTableStrategy = ({
                                     changeView,
                                     group,
                                     networks,
                                 }: Params) => {
    const [activeDropdown, setActiveDropdown] =
        React.useState<ActiveDropdown>(null);

    const [dropdownsOpen, setDropdownsOpen] = React.useState<Record<string, boolean>>(
        {},
    );

    const columns = React.useMemo(
        () => getColumns(changeView, group, false),
        [changeView, group],
    );

    const { followersSort, toggleFollowersSort, sortedNetworks } =
        useFollowersSort(networks);

    const totalFollowers = React.useMemo(
        () => networks.reduce((sum, item) => sum + Number(item.followers ?? 0), 0),
        [networks],
    );

    const isOpen = React.useCallback(
        (indexCard: number, key: DropKey) =>
            activeDropdown?.indexCard === indexCard && activeDropdown?.key === key,
        [activeDropdown],
    );

    const toggleOpen = React.useCallback((indexCard: number, key: DropKey) => {
        setActiveDropdown((prev) => {
            const isSame =
                prev?.indexCard === indexCard && prev?.key === key;

            return isSame ? null : { indexCard, key };
        });
    }, []);

    const closeAny = React.useCallback(() => {
        setActiveDropdown(null);
    }, []);

    const uniqueNetworks = React.useMemo(() => {
        const seen = new Set<string>();

        return sortedNetworks.filter((network) => {
            const key = String(network.accountId);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, [sortedNetworks]);

    return {
        columns,
        followersSort,
        toggleFollowersSort,
        totalFollowers,
        dropdownsOpen,
        setDropdownsOpen,
        uniqueNetworks,
        isOpen,
        toggleOpen,
        closeAny,
    };
};