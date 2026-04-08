import "@/client-side/styles-table/table-base.scss";

import { TableHeader } from "../components/table-header";
import { TableFooter } from "../components/table-footer";
import { TableCard } from "../card-table/table-card";

import { useTableStrategy } from "../hooks/use-table-strategy";
import { getTableColumnWidths } from "../model/table-strategy.constants";
import type { TableStrategyProps } from "../types/table-strategy.types";

export function TableStrategy({
                                  changeView,
                                  items,
                                  networks,
                                  group,
                                  totalPrice,
                                  title,
                              }: TableStrategyProps) {
    const {
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
    } = useTableStrategy({
        changeView,
        group,
        networks,
    });

    const widths = React.useMemo(
        () => getTableColumnWidths(group, changeView),
        [group, changeView],
    );

    return (
        <div className="tableBase-wrap">
            <h1>{title}</h1>

            <table className="tableBase">
                <colgroup>
                    {columns.map((key) => (
                        <col
                            key={key}
                            style={widths[key] ? { width: `${widths[key]}px` } : undefined}
                        />
                    ))}
                </colgroup>

                <TableHeader
                    columns={columns}
                    followersSort={followersSort}
                    onToggleFollowersSort={toggleFollowersSort}
                    group={group}
                />

                <tbody>
                {uniqueNetworks.map((network, index) => (
                    <TableCard
                        key={network.accountId ?? `${network.influencerId}-${index}`}
                        data={network}
                        indexCard={index}
                        columns={columns}
                        items={items}
                        group={group}
                        changeView={changeView}
                        dropdownsOpen={dropdownsOpen}
                        setDropdownsOpen={setDropdownsOpen}
                        isOpen={isOpen}
                        toggleOpen={toggleOpen}
                        closeAny={closeAny}
                    />
                ))}
                </tbody>

                <TableFooter
                    columns={columns}
                    totalPrice={totalPrice}
                    totalFollowers={totalFollowers}
                />
            </table>
        </div>
    );
}