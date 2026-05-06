import { useEffect, useRef, useState } from "react";

import { FilterNode } from "./filter-node";
import styles from "./filter-panel.module.scss";
import type {
    CampaignFilterItem,
    CampaignFilterMethod,
    CampaignFilterSection,
} from "@/entities/client-side/campaign-creator-page/campaign-filter/model/campaign-filter.types.ts";

const DEFAULT_OPEN_IDS = ["social-platforms-1", "profile-type", "music-genre"];

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
    scrollContainerRef: React.RefObject<HTMLDivElement | null>;
};

export const FilterSectionView = ({
                                      section,
                                      selectedIds,
                                      onToggleFilter,
                                      filterMethod,
                                      setFilterMethod,
                                      scrollContainerRef,
                                  }: Props) => {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const shouldScrollRef = useRef(false);

    const [open, setOpen] = useState(() =>
        DEFAULT_OPEN_IDS.includes(section.id),
    );

    useEffect(() => {
        if (!open) return;
        if (!shouldScrollRef.current) return;

        requestAnimationFrame(() => {
            const container = scrollContainerRef.current;
            const node = rootRef.current;

            if (!container || !node) return;

            const containerRect = container.getBoundingClientRect();
            const nodeRect = node.getBoundingClientRect();

            const isAbove = nodeRect.top < containerRect.top;
            const isBelow = nodeRect.bottom > containerRect.bottom;

            if (isAbove) {
                container.scrollTop += nodeRect.top - containerRect.top - 8;
            } else if (isBelow) {
                container.scrollTop += nodeRect.bottom - containerRect.bottom + 8;
            }

            shouldScrollRef.current = false;
        });
    }, [open, scrollContainerRef]);

    const onToggleSection = () => {
        setOpen((prev) => {
            const next = !prev;
            shouldScrollRef.current = next;
            return next;
        });
    };

    return (
        <div ref={rootRef} className={styles.dropdown}>
            <div
                className={styles.dropdownHead}
                onClick={onToggleSection}
            >
                <p>{section.title}</p>

                <span
                    className={`${styles.arrow} ${
                        open ? styles.arrowOpen : ""
                    }`}
                />
            </div>

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