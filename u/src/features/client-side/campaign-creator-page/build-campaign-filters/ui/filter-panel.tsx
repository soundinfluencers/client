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

const DEFAULT_OPEN_IDS = ["social-platforms-1", "profile-type"];

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

    const [openSectionIds, setOpenSectionIds] = React.useState<string[]>(
        DEFAULT_OPEN_IDS,
    );

    const toggleSection = React.useCallback((sectionId: string) => {
        setOpenSectionIds((prev) => {
            if (prev.includes(sectionId)) {
                return prev.filter((id) => id !== sectionId);
            }

            return [...prev, sectionId];
        });
    }, []);

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
                                open={openSectionIds.includes(section.id)}
                                onToggleSection={() => toggleSection(section.id)}
                            />
                        ))}
                </div>
            </div>
        </div>
    );
};