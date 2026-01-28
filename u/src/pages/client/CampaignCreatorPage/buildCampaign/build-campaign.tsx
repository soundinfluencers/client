import React from "react";
import "./scss-module/_build-compaign.scss";

import filterIcon from "@/assets/icons/filter (1).svg";
import { Search } from "./bar-ui/bc_search/bc_search";
import { SelectBudget, SortSelect } from "./bar-ui/bc_select/bc-select";
import { Filters } from "./components/bc_filters/bc-filters";
import { CardsContainer } from "./components/bc_cards/cards_content";

import { SwitchView } from "@/pages/client/components/switch-view/switch-view";
import { useCreateCampaign, useFilter } from "@/store/client/createCampaign";
import x from "@/assets/icons/x.svg";
import { BcProceed } from "./components/bc_proceed/bc_prooced";

import { useBuildCampaignFilters } from "@/store/client/createCampaign/useBuildCampaignFilters";
import { usePromoAccountsOrSearch } from "@/hooks/client/campaign-creator-page/usePromoAccountsOrSearch";
import { NoData } from "@/components/ui/no-array/no-data";

interface Props {}

export const BuildCampaign: React.FC<Props> = () => {
  const [search, setSearch] = React.useState("");

  const { selected, removeItem } = useFilter();
  const [filterFlag, setFilterFlag] = React.useState<boolean>(true);
  const [view, setView] = React.useState<number>(1);
  const { offers } = useCreateCampaign();
  const [isSmall, setIsSmall] = React.useState(false);

  const onChange = (value: string) => {
    setSearch(value);
  };

  const {
    selectedFilter,
    selectedCurrency,
    selectedBudget,
    setFilter,
    setCurrency,
    setBudget,
  } = useBuildCampaignFilters();

  const { data: promoCards } = usePromoAccountsOrSearch({
    selected,
    budget: String(selectedBudget),
    currency: selectedCurrency.currency,
    sortBy: selectedFilter.key,
    query: search,
  });

  console.log(offers, "offers");
  console.log(promoCards, "promoCards");

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
            <Search setSearch={onChange} search={search} />
          </div>
          <div className="selects">
            {" "}
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
                {item.children?.map((children) =>
                  item.children && item.children.length > 1 ? (
                    <>{children.filterName}, </>
                  ) : (
                    <>{children.filterName}</>
                  ),
                )}
                <img onClick={() => removeItem(item.id)} src={x} alt="" />
              </li>
            ))}
          </ul>
          <SwitchView view={view} setView={setView} />
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
          {promoCards.length > 0 ? (
            <CardsContainer
              promosCards={promoCards}
              isSmall={isSmall}
              setIsSmall={setIsSmall}
              view={view}
            />
          ) : (
            <NoData title={"networks for that filter"} />
          )}
        </div>
      </div>
      <BcProceed />
    </div>
  );
};
