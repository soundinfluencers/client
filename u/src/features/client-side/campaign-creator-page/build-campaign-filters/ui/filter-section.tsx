import { FilterNode } from "./filter-node";
import styles from "./filter-panel.module.scss";
import type {
    CampaignFilterItem,
    CampaignFilterMethod,
    CampaignFilterSection,
} from "@/entities/client-side/campaign-creator-page/campaign-filter/model/campaign-filter.types.ts";

type Props = {
    section: CampaignFilterSection;
    selectedIds: string[];
    onToggleFilter: (args: {
        item: CampaignFilterItem;
        checked: boolean;
        sectionFilters: CampaignFilterItem[];
    }) => void;
    filterMethod: CampaignFilterMethod;
    setFilterMethod: (value: CampaignFilterMethod) => void;
    open: boolean;
    onToggleSection: () => void;
};

export const FilterSectionView = ({
                                      section,
                                      selectedIds,
                                      onToggleFilter,
                                      filterMethod,
                                      setFilterMethod,
                                      open,
                                      onToggleSection,
                                  }: Props) => {
    return (
        <div className={styles.dropdown}>
            <button type="button" className={styles.dropdownHead} onClick={onToggleSection} aria-expanded={open}>
                <span>{section.title}</span>

                <span
                    className={`${styles.arrow} ${
                        open ? styles.arrowOpen : ""
                    }`}
                />
            </button>

            {open && (
                <>
                    {section.methods.length > 0 && (
                        <ul className={styles.methodSwitch}>
                            {section.methods.map((method) => (
                                <li
                                    key={method}
                                    className={
                                        filterMethod === method
                                            ? styles.methodActive
                                            : ""
                                    }
                                    onClick={() => setFilterMethod(method)}
                                >
                                    {method.toUpperCase()}
                                </li>
                            ))}
                        </ul>
                    )}

                    {section.filters.map((item) => (
                        <div key={item.id} className={styles.chooseContainer}>
                            <FilterNode
                                item={item}
                                selectedIds={selectedIds}
                                sectionFilters={section.filters}
                                onToggleFilter={onToggleFilter}
                            />
                        </div>
                    ))}
                </>
            )}
        </div>
    );
};
