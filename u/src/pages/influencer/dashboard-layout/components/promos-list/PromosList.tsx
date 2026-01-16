import { useDashboardLayoutStore } from "../../store/useDashboardLayoutStore";
import { PromosGrid } from "./components/promos-grid/PromosGrid";
import { PromosTable } from "./components/promos-table/PromosTable";
import { ButtonMain } from "../../../../../components/ui/buttons-fix/ButtonFix";
import { getInfluencerPromos } from "../../../../../api/influencer/promos/influencer-promos.api";
import { useInfiniteQuery } from "@tanstack/react-query";
import "./_promos-list.scss";

export const PromosList = () => {
  const { viewMode, activePromosFilter, limit } = useDashboardLayoutStore();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["promos", activePromosFilter, limit],
      initialPageParam: 1,
      queryFn: ({ pageParam }) =>
        getInfluencerPromos({
          status: activePromosFilter,
          limit,
          page: pageParam as number,
        }),

      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage || lastPage.length === 0) return undefined;
        if (lastPage.length < limit) {
          return undefined;
        }
        return allPages.length + 1;
      },
    });

  console.log(data, "awdawd");

  const activePromos = data?.pages.flat() ?? [];

  return (
    <div className="promos-list">
      <div className="promos-list__content">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <>
            {viewMode === "grid" ? (
              <PromosGrid promos={activePromos} />
            ) : (
              <div className="promos-list__scroll">
                <PromosTable promos={activePromos} />
              </div>
            )}

            <div className="promos-list__actions">
              <ButtonMain
                label={isFetchingNextPage ? "Loading..." : "View more"}
                onClick={() => fetchNextPage()}
                isDisabled={!hasNextPage || isFetchingNextPage}
              />
            </div>
          </>
        )}

        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          Scroll to top
        </button>
      </div>
    </div>
  );
};
