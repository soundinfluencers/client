import React from "react";
import "./_build-compaign.scss";

import filterIcon from "@/assets/icons/filter (1).svg";
import x from "@/assets/icons/x.svg";

import { NoData } from "@/components/ui/no-array/no-data";
import { BcProceed } from "./components/bc-proceed/bc-prooced";
import { Search, SelectBudget, SwitchView } from "@/client-side/ui";
import { SortSelect } from "@/client-side/ui/select/bc-select";
import { Filters } from "./components/filter-section/bc-filters";
import { CardsContainer } from "./components/card-section/cards-content";
import { getSocialMediaIcon } from "@/constants/social-medias";
import {useBuildCampaignView} from "@/client-side/pages/campaign-creator-page/hooks/useBuildCampaignView.ts";
import type {SocialMedia} from "@/client-side/types/common.ts";


export const BuildCampaign: React.FC = () => {
  const {
    ddRef,
    loadMoreRef,
    search,
    setSearch,
    isDropdownOpen,
    selected,
    removeItem,
    selectedFilter,
    selectedCurrency,
    selectedBudget,
    setFilter,
    setCurrency,
    setBudget,
    filterFlag,
    setFilterFlag,
    view,
    setView,
    isSmall,
    setIsSmall,
    isSearchMode,
    promoFetching,
    promoError,
    searchResults,
    searchLoading,
    searchFetching,
    searchError,
    searchRefetch,
    displayCards,
    canLoadMore,
    isInitialLoading,
    isFetchingMore,
    isRefetching,
    onPickSearchItem,
  } = useBuildCampaignView();
  console.log(displayCards)
  return (
      <div className="build-compaign">
        <div className="build-compaign__title">
          <h2>Build your custom campaign</h2>
          <p>Handpick networks, genres, and budgets to tailor your campaign</p>
        </div>

        <div className="build-compaign__content">
          <div className="toolbar">
            <div className="toolbar__finput">
              <div
                  onClick={() => setFilterFlag((prev) => !prev)}
                  className={`filter_flag ${filterFlag ? "active" : ""}`}
              >
                <img src={filterIcon} alt="" />
                <p>Filters</p>
              </div>

              <div ref={ddRef} className="search-with-dropdown">
                <Search
                    isSearchMode={isSearchMode}
                    setSearch={setSearch}
                    search={search}
                />

                {isSearchMode && isDropdownOpen && (
                    <div className="search-dropdown">
                      {searchLoading || searchFetching ? (
                          <div className="search-dropdown__item">Loading…</div>
                      ) : searchError ? (
                          <div className="search-dropdown__item">
                            Failed to search
                            <button onClick={() => searchRefetch()}>Retry</button>
                          </div>
                      ) : searchResults.length > 0 ? (
                          searchResults.slice(0,7).map((account) => (
                              <div
                                  key={account.accountId}
                                  className="search-dropdown__item"
                                  onClick={() => onPickSearchItem(account)}
                              >
                                <div className="title">
                                  <img
                                      src={getSocialMediaIcon(account.socialMedia as SocialMedia) || ''}
                                      alt=""
                                  />
                                  <p>{account.username}</p>
                                </div>
                                <div className="price">{account.prices.EUR}€</div>
                              </div>
                          ))
                      ) : (
                          <div className="search-dropdown__item">No results</div>
                      )}
                    </div>
                )}
              </div>
            </div>

            <div className="selects">
              <SelectBudget
                  budgetSelected={selectedBudget}
                  currencySelected={selectedCurrency}
                  setBudget={setBudget}
                  setCurrency={setCurrency}
              />
              <SortSelect
                  setSelectedFilter={setFilter}
                  selectedFilter={selectedFilter}
              />
            </div>
          </div>

          <div className="build-compaign__viewAfilters">
            <ul>
              {selected.map((item) => {
                const selectedSocialCount = selected.filter(
                    (filter) => filter.group === "socialMedia",
                ).length;

                const hideRemoveButton =
                    item.group === "socialMedia" && selectedSocialCount <= 1;

                return (
                    <li key={item.id}>
                      {item.filterName}{" "}
                      {item.children?.map((child, idx) => (
                          <span key={child.id}>
                            {child.filterName}
                                              {idx < (item.children?.length ?? 0) - 1 ? ", " : ""}
                          </span>
                                        ))}

                      {!hideRemoveButton && (
                          <img onClick={() => removeItem(item.id)} src={x} alt="" />
                      )}
                    </li>
                );
              })}
            </ul>

            <SwitchView
                className="build-compaign__viewAfilters--add"
                view={view}
                setView={setView}
            />
          </div>

          <div
              className={`build-compaign__content_functional ${
                  isSmall ? "tableAdaptive" : ""
              }`}
          >
            {filterFlag && (
                <Filters
                    isSmall={isSmall}
                    onToggle={() => setFilterFlag((prev) => !prev)}
                />
            )}

            {promoError ? (
                <NoData>
                  <h2>No SocialAccounts for this filter right now</h2>
                  <p>
                    You can still move forward by using Offers to create a <br />
                    multi-platform promotion tailored to your needs.
                  </p>
                </NoData>
            ) : displayCards.length === 0 ? (
                <NoData>
                  <h2>No Accounts</h2>
                  <p>Try changing filters or come back later.</p>
                </NoData>
            ) : (
                <CardsContainer
                    promosCards={displayCards}
                    isSmall={isSmall}
                    setIsSmall={setIsSmall}
                    view={view}
                    isInitialLoading={isInitialLoading}
                    isFetchingMore={isFetchingMore}
                    isRefetching={isRefetching}
                />
            )}
          </div>
        </div>

        {!isSearchMode && canLoadMore && (
            <div
                ref={loadMoreRef}
                style={{
                  margin: "16px auto",
                  maxWidth: "250px",
                  padding: "12px 0",
                  textAlign: "center",
                  opacity: promoFetching ? 0.6 : 1,
                }}
            >
              {promoFetching ? "Loading…" : "Scroll to load more"}
            </div>
        )}

        <BcProceed />
      </div>
  );
};