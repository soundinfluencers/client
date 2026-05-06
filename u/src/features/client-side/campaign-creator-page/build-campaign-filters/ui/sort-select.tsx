import React from "react";
import check from "@/assets/icons/check.svg";
import {
    CAMPAIGN_SORT_OPTIONS,
} from "@/features/client-side/campaign-creator-page/build-campaign-filters/build-campaign-params.constants.ts";
import type {
    CampaignSortOption,
} from "@/entities/client-side/campaign-creator-page/campaign-filter/model/campaign-filter.types.ts";

import styles from "./sort-select.module.scss";
import {
    DropdownSelect
} from "@/features/client-side/campaign-creator-page/build-campaign-filters/ui/dropdown-select.tsx";

type Props = {
    setSelectedSort: (f: CampaignSortOption) => void;
    selectedSort: CampaignSortOption;
};

export const SortSelect = ({
                               selectedSort,
                               setSelectedSort,
                           }: Props) => {
    const [open, setOpen] = React.useState(false);

    return (
        <div className={styles.root}>
            <DropdownSelect
                isChange
                selected={selectedSort?.name}
                isOpen={open}
                setOpen={setOpen}
            >
                <ul className={styles.list}>
                    {CAMPAIGN_SORT_OPTIONS.map((item) => (
                        <li
                            className={styles.item}
                            onClick={() => {
                                setOpen(false);
                                setSelectedSort(item);
                            }}
                            key={item?.key}
                        >
                            {item?.name}
                            {item?.key === selectedSort?.key && (
                                <img className={styles.icon} src={check} alt="" />
                            )}
                        </li>
                    ))}
                </ul>
            </DropdownSelect>
        </div>
    );
};