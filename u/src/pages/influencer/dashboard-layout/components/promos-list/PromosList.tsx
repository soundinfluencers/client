import { useDashboardLayoutStore } from "../../store/useDashboardLayoutStore";
import { PromosGrid } from "./components/promos-grid/PromosGrid";
import { PromosTable } from "./components/promos-table/PromosTable";
import { ButtonMain } from "@components/ui/buttons-fix/ButtonFix.tsx";
import { useDashboardPromos } from "@/pages/influencer/promos/hooks/useDashboardPromos";

// import { Loader } from "@/components";

// import { ScrollToTop } from "@/components/ui/scroll-to-top/ScrollToTop";
// import { toast } from "react-toastify";
// import { CardSkeleton } from "@/shared/ui/skeletons/card-skeleton.tsx";
// import { TableCardSkeleton } from "@/shared/ui/skeletons/table-card-skeleton.tsx";
// import { EmptyPromosList } from "@/pages/influencer/shared/components/empty-promo-list/EmptyPromoList.tsx";
// import { TableCardSkeleton } from "@/shared/ui/skeletons/table-card-skeleton.tsx";
// import { SmallLoader } from "@components/ui/small-loader/SmallLoader.tsx";
import "./_promos-list.scss";
import { Error } from "@/pages/influencer/shared/components/error/Error.tsx";

export const PromosList = () => {
  const { viewMode, activePromosFilter, limit } = useDashboardLayoutStore();

  // console.log(activePromosFilter);

  const { data, isError, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching, isPending, refetch } =
    useDashboardPromos(activePromosFilter, limit);

  // console.log("Promos query status:", { isError, isFetching, isFetchingNextPage, hasNextPage, isPending });

  // console.log("Promos data:", data);

  const activePromos = data?.pages.flat() ?? [];
  // console.log('Filtered promos', filteredPromos);
  console.log("Promos data:", activePromos);

  const isInitialLoading = isPending && !data;
  const isLoadingMore = isFetchingNextPage;
  const isRefreshing = isFetching && !isFetchingNextPage && !!data;

  if (isError) {
    return (
      <Error onRetry={() => { void refetch(); }} />
    );
  }

  return (
    <div className="promos-list">
      {
        <div className="promos-list__content">
          {viewMode === "grid" ? (
            <PromosGrid
              promos={activePromos}
              isInitialLoading={isInitialLoading}
              isRefreshing={isRefreshing}
            />
          ) : (
            <div className="promos-list__scroll">
              <PromosTable
                promos={activePromos}
                isInitialLoading={isInitialLoading}
                isRefreshing={isRefreshing}
              />
            </div>
          )}

          {activePromos.length !== 0 && (
            <div className="promos-list__actions">
              <ButtonMain
                label={isLoadingMore ? "Loading..." : "View more"}
                onClick={() => hasNextPage && fetchNextPage()}
                isDisabled={!hasNextPage || isLoadingMore}
              />
            </div>
          )}
        </div>
      }
    </div>
  );
};

// <SmallLoader />
{/* <ScrollToTop/> */
}
{/* <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          Scroll to top
        </button> */
}
