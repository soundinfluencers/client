import type {
    CampaignFilterItem
} from "@/entities/client-side/campaign-creator-page/campaign-filter/model/campaign-filter.types.ts";
import styles from "./filter-panel.module.scss";

type Props = {
    item: CampaignFilterItem;
    selectedIds: string[];
    sectionFilters: CampaignFilterItem[];
    onToggleFilter: (args: {
        item: CampaignFilterItem;
        checked: boolean;
        sectionFilters: CampaignFilterItem[];
    }) => void;
};

const isNodeChecked = (
    item: CampaignFilterItem,
    selectedIds: string[],
): boolean => {
    if (selectedIds.includes(item.id)) return true;

    if (item.children?.length) {
        return item.children.some((child) => isNodeChecked(child, selectedIds));
    }

    return false;
};

const flatten = (items: CampaignFilterItem[]): CampaignFilterItem[] =>
    items.flatMap((item) => [
        item,
        ...(item.children ? flatten(item.children) : []),
    ]);

export const FilterNode = ({
                               item,
                               selectedIds,
                               sectionFilters,
                               onToggleFilter,
                           }: Props) => {
    const checked = isNodeChecked(item, selectedIds);

    const selectedSocialCount = flatten(sectionFilters).filter(
        (entry) =>
            entry.group === "socialMedia" && selectedIds.includes(entry.id),
    ).length;

    const isLastSocial =
        item.group === "socialMedia" &&
        checked &&
        selectedSocialCount <= 1;

    return (
        <div className={styles.choose}>
            <div className={styles.choose__home}>
                <div
                    className={`${styles.parent_item} ${checked ? styles.parent_item_active : ""}`}
                >
                    <input
                        id={item.id}
                        type="checkbox"
                        checked={checked}
                        disabled={isLastSocial}
                        onChange={(e) =>
                            onToggleFilter({
                                item,
                                checked: e.target.checked,
                                sectionFilters,
                            })
                        }
                    />
                    <label htmlFor={item.id}>{item.filterName}</label>
                    <span>{item.count}</span>
                </div>

                {item.children && (
                    <div className={styles.children}>
                        {item.children.map((child) => (
                            <FilterNode
                                key={child.id}
                                item={child}
                                selectedIds={selectedIds}
                                sectionFilters={sectionFilters}
                                onToggleFilter={onToggleFilter}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};