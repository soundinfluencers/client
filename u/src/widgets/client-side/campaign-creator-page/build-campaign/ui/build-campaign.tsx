import filterIcon from "@/assets/icons/filter (1).svg";
import { NoData } from "@components/ui/no-array/no-data";
import { getSocialMediaIcon } from "@/constants/social-medias";

import styles from "./build-campaign.module.scss";
import {
    useBuildCampaignView
} from "@/widgets/client-side/campaign-creator-page/build-campaign/model/use-build-campaign-view.ts";
import {SearchInput} from "@/features/client-side/campaign-creator-page/build-campaign-filters/ui/search-input.tsx";
import {BudgetSelect} from "@/features/client-side/campaign-creator-page/build-campaign-filters/ui/budget-select.tsx";
import {SortSelect} from "@/features/client-side/campaign-creator-page/build-campaign-filters/ui/sort-select.tsx";
import {
    SelectedFilters
} from "@/features/client-side/campaign-creator-page/build-campaign-filters/ui/selected-filters.tsx";
import {ViewSwitch} from "@/features/client-side/campaign-creator-page/build-campaign-filters/ui/view-switch.tsx";
import {FilterPanel} from "@/features/client-side/campaign-creator-page/build-campaign-filters/ui/filter-panel.tsx";
import type {SocialMediaType} from "@/shared/types/utils/constants.types.ts";
import {
    CardsContainer
} from "@/widgets/client-side/campaign-creator-page/build-campaign/components/cards-container.tsx";

export const BuildCampaign = () => {
    const vm = useBuildCampaignView();

    return (
        <div className={styles.root}>
            <div className={styles.title}>
                <h2>Build your custom campaign</h2>
                <p>Handpick networks, genres, and budgets to tailor your campaign</p>
            </div>

            <div className={styles.content}>
                <div className={styles.toolbar}>
                    <div className={styles.toolbarFiltersInput}>
                        <button
                            type="button"
                            onClick={() => vm.setPanelOpen(!vm.filterPanelOpen)}
                            className={`${styles.filterFlag} ${
                                vm.filterPanelOpen ? styles.active : ""
                            }`}
                        >
                            <img src={filterIcon} alt="" />
                            <p>Filters</p>
                        </button>

                        <div ref={vm.ddRef} className={styles.searchWithDropdown}>
                            <SearchInput
                                active={vm.isSearchMode}
                                onChange={vm.setSearch}
                                value={vm.search}
                            />

                            {vm.isSearchMode && vm.isDropdownOpen && (
                                <div className={styles.searchDropdown}>
                                    {vm.searchLoading || vm.searchFetching ? (
                                        <div className={styles.searchDropdownItem}>Loading…</div>
                                    ) : vm.searchError ? (
                                        <div className={styles.searchDropdownItem}>
                                            Failed to search
                                            <button onClick={() => vm.searchRefetch()}>Retry</button>
                                        </div>
                                    ) : vm.searchResults.length > 0 ? (
                                        vm.searchResults.map((account) => (
                                            <div
                                                key={account.accountId}
                                                className={styles.searchDropdownItem}
                                                onClick={() => vm.onPickSearchItem(account)}
                                            >
                                                <div className={styles.searchTitle}>
                                                    <img
                                                        src={getSocialMediaIcon(account.socialMedia as SocialMediaType) || ""}
                                                        alt=""
                                                    />
                                                    <p>{account.username}</p>
                                                </div>
                                                <div className={styles.price}>
                                                    {account.prices.EUR ?? 0}€
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className={styles.searchDropdownItem}>No results</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.selects}>
                        <BudgetSelect
                            budgetSelected={vm.selectedBudget || 0}
                            currencySelected={vm.selectedCurrency}
                            setBudget={vm.setBudget}
                            setCurrency={vm.setCurrency}
                        />
                        <SortSelect
                            selectedSort={vm.selectedSort}
                            setSelectedSort={vm.setSort}
                        />
                    </div>
                </div>

                <div className={styles.viewAndFilters}>
                    <SelectedFilters
                        selected={vm.selected}
                        onRemove={vm.removeSelectedTag}
                    />

                    <ViewSwitch
                        className={styles.viewSwitcher}
                        view={vm.view}
                        setView={vm.setView}
                    />
                </div>

                <div
                    className={`${styles.functional} ${
                        vm.isSmall ? styles.tableAdaptive : ""
                    }`}
                >
                    {vm.filterPanelOpen && (
                        <FilterPanel
                            isSmall={vm.isSmall}
                            onToggle={() => vm.setPanelOpen(false)}
                            sections={vm.filtersSections}
                            isLoading={vm.filtersLoading}
                            selectedIds={vm.selectedFilterIds}
                            onToggleFilter={vm.onToggleFilter}
                            filterMethod={vm.filterMethod}
                            setFilterMethod={vm.setMethod}
                        />
                    )}

                    {vm.promoError || vm.isEmpty ? (
                        <NoData>
                            <h2>No SocialAccounts for this filter right now</h2>
                            <p>
                                You can still move forward by using Offers to create a
                                multi-platform promotion tailored to your needs.
                            </p>
                        </NoData>
                    ) : (
                        <CardsContainer
                            promosCards={vm.displayCards}
                            isSmall={vm.isSmall}
                            setIsSmall={vm.setIsSmall}
                            view={vm.view}
                            isInitialLoading={vm.isInitialLoading}
                            isFetchingMore={vm.isFetchingMore}
                            isRefetching={vm.isRefetching}
                        />
                    )}
                </div>
            </div>

            {!vm.isSearchMode && vm.loadMoreRef && (
                <div
                    ref={vm.loadMoreRef}
                    style={{
                        margin: "16px auto",
                        maxWidth: "250px",
                        padding: "12px 0",
                        textAlign: "center",
                        opacity: vm.promoFetching ? 0.6 : 1,
                    }}
                >
                </div>
            )}

            {/*<ProceedSummary />*/}
        </div>
    );
};