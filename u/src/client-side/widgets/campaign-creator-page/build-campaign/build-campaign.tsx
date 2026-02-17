import React from "react";
import "./_build-compaign.scss";

import filterIcon from "@/assets/icons/filter (1).svg";

import x from "@/assets/icons/x.svg";
import { BcProceed } from "./components/bc-proceed/bc-prooced";

import { NoData } from "@/components/ui/no-array/no-data";

import type { IPromoCard } from "@/types/client/creator-campaign/creator-campaign.types";

import { getSocialMediaIcon } from "@/constants/social-medias";
import type { SocialMediaType } from "@/types/utils/constants.types";

import { Search, SelectBudget, SwitchView } from "@/client-side/ui";
import { SortSelect } from "@/client-side/ui/select/bc-select";
import { Filters } from "./components/filter-section/bc-filters";
import { CardsContainer } from "./components/card-section/cards-content";
import { usePromoCardsAndSearch } from "@/client-side/hooks";
import {
  useBuildCampaignFilters,
  useCreateCampaign,
  useFilter,
} from "@/client-side/store";
import { ButtonMain } from "@/components";
import { useClickOutside } from "@/shared/lib/hooks/useClickOutside";

export const BuildCampaign: React.FC = () => {
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const ddRef = React.useRef<HTMLDivElement | null>(null);
  const [search, setSearch] = React.useState("");
  const [pickedFromSearch, setPickedFromSearch] =
    React.useState<IPromoCard | null>(null);
  const [limit, setLimit] = React.useState(24);

  const { selected, removeItem } = useFilter();
  const [filterFlag, setFilterFlag] = React.useState(true);
  const [view, setView] = React.useState<number>(1);
  const [isSmall, setIsSmall] = React.useState(false);

  const {
    selectedFilter,
    selectedCurrency,
    selectedBudget,
    setFilter,
    setCurrency,
    setBudget,
    FilterMethod,
  } = useBuildCampaignFilters();

  const {
    isSearchMode,
    promoCards,
    promoLoading,
    promoFetching,
    promoError,
    promoRefetch,

    searchResults,
    searchLoading,
    searchFetching,
    searchError,
    searchRefetch,
  } = usePromoCardsAndSearch({
    selected,
    budget: String(selectedBudget),
    currency: selectedCurrency.currency,
    sortBy: selectedFilter.key,
    query: search,
    FilterMethod,
    limit,
  });

  const promoPending = useCreateCampaign((s) => s.pending.promoCards);
  const setPending = useCreateCampaign((s) => s.setPending);
  const setPromoCards = useCreateCampaign((s) => s.setPromoCards);

  React.useEffect(() => {
    if (search.trim().length === 0) {
      setPickedFromSearch(null);
    }
  }, [search]);

  React.useEffect(() => {
    setPending("promoCards", promoLoading || promoFetching);
  }, [promoLoading, promoFetching, setPending]);

  const displayCards: IPromoCard[] = React.useMemo(() => {
    if (search.trim().length === 0) return promoCards as IPromoCard[];

    return pickedFromSearch ? [pickedFromSearch] : (promoCards as IPromoCard[]);
  }, [search, promoCards, pickedFromSearch]);

  React.useEffect(() => {
    setPromoCards(displayCards);
  }, [displayCards, setPromoCards]);
  React.useEffect(() => {
    if (isSearchMode) setIsDropdownOpen(true);
    if (!isSearchMode) setIsDropdownOpen(false);
  }, [isSearchMode]);
  React.useEffect(() => {
    if (!isDropdownOpen) return;

    const onDown = (e: MouseEvent | TouchEvent) => {
      const el = ddRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);

    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [isDropdownOpen]);
  const onPickSearchItem = React.useCallback((item: any) => {
    setPickedFromSearch(item as IPromoCard);
    setIsDropdownOpen(false);
  }, []);
  useClickOutside(dropdownRef, () => {
    setIsDropdownOpen(false);
    setSearch("");
    setPickedFromSearch(null);
  });

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
              className={`filter_flag ${filterFlag ? "active" : ""}`}>
              <img src={filterIcon} alt="" />
              <p>Filters</p>
            </div>

            <div ref={dropdownRef} className="search-with-dropdown">
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
                    searchResults.map((acc: IPromoCard) => (
                      <div
                        key={acc._id}
                        className="search-dropdown__item"
                        onClick={() => onPickSearchItem(acc)}>
                        <div className="title">
                          <img
                            src={getSocialMediaIcon(
                              acc.socialMedia as SocialMediaType,
                            )}
                            alt=""
                          />
                          <p>{acc.username}</p>
                        </div>
                        <div className="price">{acc.prices.EUR}€</div>
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
            {selected.map((item) => (
              <li key={item.id}>
                {item.filterName}{" "}
                {item.children?.map((child, idx) => (
                  <span key={child.id ?? idx}>
                    {child.filterName}
                    {idx < (item.children?.length ?? 0) - 1 ? ", " : ""}
                  </span>
                ))}
                <img onClick={() => removeItem(item.id)} src={x} alt="" />
              </li>
            ))}
          </ul>

          <SwitchView
            className="build-compaign__viewAfilters--add"
            view={view}
            setView={setView}
          />
        </div>

        <div
          className={`build-compaign__content_functional ${isSmall ? "tableAdaptive" : ""}`}>
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
                You can still move forward by using Offers to create a <br></br>
                multi-platform promotion tailored to your needs.
              </p>
            </NoData>
          ) : displayCards.length > 0 ? (
            <CardsContainer
              loading={promoFetching}
              promosCards={displayCards}
              isSmall={isSmall}
              setIsSmall={setIsSmall}
              view={view}
            />
          ) : (
            <NoData>
              <h2>No SocialAccounts for this filter right now</h2>
              <p>
                You can still choose another option,currency,filter to create a
                <br></br>
                multi-platform promotion tailored to your needs.
              </p>
            </NoData>
          )}
        </div>
      </div>
      {!isSearchMode && (promoCards as IPromoCard[]).length >= limit && (
        <div style={{ margin: "16px auto", maxWidth: "250px" }}>
          <ButtonMain
            text={promoFetching ? "Loading..." : "View more"}
            onClick={() => setLimit((prev) => prev + 24)}
          />
        </div>
      )}

      <BcProceed />
    </div>
  );
};
