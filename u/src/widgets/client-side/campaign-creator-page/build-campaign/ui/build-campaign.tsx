import filterIcon from "@/assets/icons/filter (1).svg";
import { NoData } from "@components/ui/no-array/no-data";
import { getSocialMediaIcon } from "@/constants/social-medias";
import {
    useCallback,
    useMemo,
    useRef,
    useState,
} from "react";

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
import {useSearchParams} from "react-router-dom";
import {
    CampaignCatalogModeToggle,
} from "@/features/client-side/campaign-creator-page/campaign-catalog-mode-toggle";
import type {
    CampaignCatalogMode,
} from "@/features/client-side/campaign-creator-page/campaign-catalog-mode-toggle";
import {
    BundleCatalog,
} from "@/widgets/client-side/campaign-creator-page/build-campaign/components/bundle-catalog";
import {
    BundleGridSkeleton,
} from "@/widgets/client-side/campaign-creator-page/build-campaign/components/bundle-grid";
import {
    useBundleByIdFetcher,
} from "@/entities/client-side/campaign-creator-page/bundle";
import {
    useCampaignBuilderStore,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder.store";
import {
    getBundleSelectionBlockReason,
    getSelectedBundleIds,
    isBundleFullyIncludedInOffer,
} from "@/entities/client-side/campaign-creator-page/campaign-builder/model/campaign-builder-selection";

export const BuildCampaign = () => {
    const [searchParams] = useSearchParams();
    const isAddInfluencerMode = searchParams.get("mode") === "add-influencer";
    const [catalogMode, setCatalogMode] =
        useState<CampaignCatalogMode>("networks");
    const vm = useBuildCampaignView(catalogMode);
    const fetchBundleById = useBundleByIdFetcher();
    const [pendingBundleIds, setPendingBundleIds] = useState<
        ReadonlySet<string>
    >(() => new Set());
    const pendingBundleIdsRef = useRef(new Set<string>());
    const activeCurrencyRef = useRef(vm.selectedCurrencyCode);
    activeCurrencyRef.current = vm.selectedCurrencyCode;
    const selectedBundles = useCampaignBuilderStore(
        (state) => state.selectedBundles,
    );
    const selectedOfferId = useCampaignBuilderStore(
        (state) => state.selectedOfferId,
    );
    const selectedOfferAccountIds = useCampaignBuilderStore(
        (state) => state.selectedOfferAccountIds,
    );
    const selectBundle = useCampaignBuilderStore(
        (state) => state.actions.selectBundle,
    );
    const removeBundle = useCampaignBuilderStore(
        (state) => state.actions.removeBundle,
    );
    const selectedBundleIds = useMemo(
        () => getSelectedBundleIds(selectedBundles),
        [selectedBundles],
    );
    const includedBundleIds = useMemo(() => {
        const includedIds = new Set<string>();

        if (!selectedOfferId) return includedIds;

        const includeFullyContainedBundle = (bundle: {
            bundleId: string;
            accounts: readonly { accountId: string }[];
        }) => {
            if (
                !selectedBundleIds.has(bundle.bundleId) &&
                isBundleFullyIncludedInOffer(
                    bundle,
                    selectedOfferAccountIds,
                )
            ) {
                includedIds.add(bundle.bundleId);
            }
        };

        vm.bundles.forEach(includeFullyContainedBundle);
        vm.displayCards.forEach((account) =>
            account.bundlePreviews.forEach(
                includeFullyContainedBundle,
            ),
        );

        return includedIds;
    }, [
        selectedBundleIds,
        selectedOfferAccountIds,
        selectedOfferId,
        vm.bundles,
        vm.displayCards,
    ]);
    const disabledBundleIds = useMemo(
        () =>
            new Set(
                vm.bundles
                    .filter(
                        (bundle) =>
                            !selectedBundleIds.has(bundle.bundleId) &&
                            getBundleSelectionBlockReason({
                                bundle,
                                selectedBundles,
                                selectedOfferId,
                                selectedOfferAccountIds,
                                currency: vm.selectedCurrencyCode,
                            }) !== null,
                    )
                    .map((bundle) => bundle.bundleId),
            ),
        [
            selectedBundleIds,
            selectedBundles,
            selectedOfferId,
            selectedOfferAccountIds,
            vm.bundles,
            vm.selectedCurrencyCode,
        ],
    );
    const disabledEmbeddedBundleIds = useMemo(() => {
        const disabledIds = new Set<string>();

        vm.displayCards.forEach((account) => {
            account.bundlePreviews.forEach((preview) => {
                if (
                    !selectedBundleIds.has(preview.bundleId) &&
                    getBundleSelectionBlockReason({
                        bundle: preview,
                        selectedBundles,
                        selectedOfferId,
                        selectedOfferAccountIds,
                        currency: vm.selectedCurrencyCode,
                    }) !== null
                ) {
                    disabledIds.add(preview.bundleId);
                }
            });
        });

        return disabledIds;
    }, [
        selectedBundleIds,
        selectedBundles,
        selectedOfferId,
        selectedOfferAccountIds,
        vm.displayCards,
        vm.selectedCurrencyCode,
    ]);
    const handleChooseBundle = useCallback(
        (bundleId: string) => {
            const bundle = vm.bundles.find(
                (item) => item.bundleId === bundleId,
            );

            if (!bundle) return;

            selectBundle(bundle, vm.selectedCurrencyCode);
        },
        [
            selectBundle,
            vm.bundles,
            vm.selectedCurrencyCode,
        ],
    );
    const handleRemoveBundle = useCallback(
        (bundleId: string) => removeBundle(bundleId),
        [removeBundle],
    );
    const handleChooseEmbeddedBundle = useCallback(
        async (bundleId: string) => {
            const currentState = useCampaignBuilderStore.getState();
            const isAlreadySelected = currentState.selectedBundles.some(
                (bundle) => bundle.bundleId === bundleId,
            );

            if (
                isAlreadySelected ||
                pendingBundleIdsRef.current.has(bundleId)
            ) {
                return;
            }

            pendingBundleIdsRef.current.add(bundleId);
            setPendingBundleIds(
                new Set(pendingBundleIdsRef.current),
            );

            try {
                const bundle = await fetchBundleById(bundleId);
                const latestState =
                    useCampaignBuilderStore.getState();

                if (
                    latestState.selectedBundles.some(
                        (selectedBundle) =>
                            selectedBundle.bundleId === bundleId,
                    )
                ) {
                    return;
                }

                latestState.actions.selectBundle(
                    bundle,
                    activeCurrencyRef.current,
                );
            } catch {
                // The shared API interceptor reports the request error.
            } finally {
                pendingBundleIdsRef.current.delete(bundleId);
                setPendingBundleIds(
                    new Set(pendingBundleIdsRef.current),
                );
            }
        },
        [fetchBundleById],
    );

    return (
        <div className={styles.root}>
            <div className={styles.title}>
                <h2>
                    {isAddInfluencerMode
                        ? "Add influencers to proposal"
                        : "Build your custom campaign"}
                </h2>

                <p>
                    {isAddInfluencerMode
                        ? "Select new networks to add to this proposal option"
                        : "Handpick networks, genres, and budgets to tailor your campaign"}
                </p>
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

                        <CampaignCatalogModeToggle
                            mode={catalogMode}
                            onModeChange={setCatalogMode}
                        />

                        <div ref={vm.ddRef} className={styles.searchWithDropdown}>
                            <SearchInput
                                active={
                                    catalogMode === "networks" &&
                                    vm.isSearchMode
                                }
                                onChange={vm.setSearch}
                                value={vm.search}
                                disabled={catalogMode === "bundles"}
                            />

                            {catalogMode === "networks" &&
                                vm.isSearchMode &&
                                vm.isDropdownOpen && (
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
                                                    {account.prices[
                                                        vm.selectedCurrencyCode
                                                    ] ?? "—"}
                                                    {vm.selectedCurrency.key}
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

                    {catalogMode === "networks" && (
                        <ViewSwitch
                            className={styles.viewSwitcher}
                            view={vm.view}
                            setView={vm.setView}
                        />
                    )}
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

                    {catalogMode === "bundles" &&
                    vm.bundleIsInitialLoading ? (
                        <BundleGridSkeleton />
                    ) : catalogMode === "bundles" && vm.bundleError ? (
                        <NoData>
                            <h2>Failed to load Bundles</h2>
                            <p>Please try again later.</p>
                        </NoData>
                    ) : catalogMode === "bundles" && vm.bundleIsEmpty ? (
                        <NoData>
                            <h2>No Bundles for this filter right now</h2>
                            <p>Try changing the selected filters.</p>
                        </NoData>
                    ) : catalogMode === "bundles" ? (
                        <BundleCatalog
                            bundles={vm.bundleCards}
                            selectedBundleIds={selectedBundleIds}
                            includedBundleIds={includedBundleIds}
                            disabledBundleIds={disabledBundleIds}
                            onChoose={handleChooseBundle}
                            onRemove={handleRemoveBundle}
                        />
                    ) : vm.promoError || vm.isEmpty ? (
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
                            selectedBundleIds={selectedBundleIds}
                            includedBundleIds={includedBundleIds}
                            pendingBundleIds={pendingBundleIds}
                            disabledEmbeddedBundleIds={
                                disabledEmbeddedBundleIds
                            }
                            onChooseEmbeddedBundle={
                                handleChooseEmbeddedBundle
                            }
                        />
                    )}
                </div>
            </div>

            {catalogMode === "networks" && !vm.isSearchMode && vm.loadMoreRef && (
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

            {catalogMode === "bundles" &&
                !vm.bundleIsInitialLoading &&
                !vm.bundleError &&
                !vm.bundleIsEmpty && (
                    <div
                        ref={vm.bundleLoadMoreRef}
                        className={styles.loadMore}
                        aria-hidden="true"
                        style={{
                            opacity: vm.bundleIsLoadingMore ? 0.6 : 1,
                        }}
                    />
                )}

            {/*<ProceedSummary />*/}
        </div>
    );
};
