import React from "react";
import "./scss-module/_build-compaign.scss";

import filterIcon from "@/assets/icons/filter (1).svg";
import { Search } from "./bar-ui/bc_search/bc_search";
import { SelectBudget, SortSelect } from "./bar-ui/bc_select/bc-select";
import { Filters } from "./components/bc-filters/bc-filters";
import { CardsContainer } from "./components/bc-cards/cards-content";

import { SwitchView } from "@/pages/client/components/switch-view/switch-view";
import { useCreateCampaign, useFilter } from "@/store/client/create-campaign";
import x from "@/assets/icons/x.svg";
import { BcProceed } from "./components/bc-proceed/bc-prooced";

import { useBuildCampaignFilters } from "@/store/client/create-campaign/useBuildCampaignFilters";
import { NoData } from "@/components/ui/no-array/no-data";
import { usePromoAccountsOrSearch } from "../hooks/use-promo-accounts-or-search";

export const BuildCampaign: React.FC = () => {
  const [search, setSearch] = React.useState("");

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

  // ✅ TanStack fetch promo cards
  const {
    data: promoCards = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = usePromoAccountsOrSearch({
    selected,
    budget: String(selectedBudget),
    currency: selectedCurrency.currency,
    sortBy: selectedFilter.key,
    query: search,
    FilterMethod,
  });

  // zustand
  const promoPending = useCreateCampaign((s) => s.pending.promoCards);
  const setPending = useCreateCampaign((s) => s.setPending);
  const setPromoCards = useCreateCampaign((s) => s.setPromoCards);

  // ✅ pending promo -> store
  React.useEffect(() => {
    setPending("promoCards", isLoading || isFetching);
  }, [isLoading, isFetching, setPending]);

  // ✅ promo data -> store (если тебе нужно в других местах/селекторы)
  React.useEffect(() => {
    setPromoCards(promoCards);
  }, [promoCards, setPromoCards]);

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

            <Search setSearch={setSearch} search={search} />
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
          className={`build-compaign__content_functional ${
            isSmall ? "tableAdaptive" : ""
          }`}>
          {filterFlag && (
            <Filters
              isSmall={isSmall}
              onToggle={() => setFilterFlag((prev) => !prev)}
            />
          )}

          {/* ✅ Ошибка promo */}
          {isError ? (
            <div style={{ padding: 16 }}>
              <p>Failed to load promo cards</p>
              <button onClick={() => refetch()}>Retry</button>
            </div>
          ) : (
            <>
              {/* ✅ NoData только когда promo уже НЕ pending */}
              {!promoPending &&
                (promoCards.length > 0 ? (
                  <CardsContainer
                    promosCards={promoCards}
                    isSmall={isSmall}
                    setIsSmall={setIsSmall}
                    view={view}
                  />
                ) : (
                  <NoData title={"networks for that filter"} />
                ))}
            </>
          )}
        </div>
      </div>

      <BcProceed />
    </div>
  );
};
