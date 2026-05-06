import React from "react";
import cross from "@/assets/icons/x.svg";
import { FilterSkeleton } from "@components/ui/skeletons/filtre-skeleton";
import { FilterSectionView } from "./filter-section";
import styles from "./filter-panel.module.scss";
import type {
    CampaignFilterItem,
    CampaignFilterMethod,
    CampaignFilterSection,
} from "@/entities/client-side/campaign-creator-page/campaign-filter/model/campaign-filter.types.ts";

type Props = {
    onToggle: () => void;
    isSmall: boolean;
    sections: CampaignFilterSection[];
    isLoading: boolean;
    selectedIds: string[];
    onToggleFilter: (args: {
        item: CampaignFilterItem;
        checked: boolean;
        sectionFilters: CampaignFilterItem[];
    }) => void;
    filterMethod: CampaignFilterMethod;
    setFilterMethod: (value: CampaignFilterMethod) => void;
};

export const FilterPanel = ({
                                onToggle,
                                isSmall,
                                sections,
                                isLoading,
                                selectedIds,
                                onToggleFilter,
                                filterMethod,
                                setFilterMethod,
                            }: Props) => {
    const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);

    return (
        <div className={`${styles.sticky} ${isSmall ? styles.tableFilter : ""}`}>
            <div className={styles.panel}>
                <div className={styles.head}>
                    <h3>Filters</h3>
                    <img onClick={onToggle} src={cross} alt="" />
                </div>

                <div ref={scrollContainerRef} className={styles.content}>
                    {isLoading
                        ? Array.from({ length: 12 }).map((_, index) => (
                            <FilterSkeleton key={index} />
                        ))
                        : sections.map((section) => (
                            <FilterSectionView
                                key={section.id}
                                section={section}
                                selectedIds={selectedIds}
                                onToggleFilter={onToggleFilter}
                                filterMethod={filterMethod}
                                setFilterMethod={setFilterMethod}
                                scrollContainerRef={scrollContainerRef}
                            />
                        ))}
                </div>
            </div>
        </div>
    );
};