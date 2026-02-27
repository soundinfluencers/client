import { useDashboardLayoutStore } from "../../store/useDashboardLayoutStore";
import { PromosGrid } from "./components/promos-grid/PromosGrid";
import { PromosTable } from "./components/promos-table/PromosTable";
import { ButtonMain } from "@components/ui/buttons-fix/ButtonFix.tsx";
import { getInfluencerPromos } from "@/api/influencer/promos/influencer-promos.api.ts";
import { useInfiniteQuery } from "@tanstack/react-query";
// import { Loader } from "@/components";

// import { ScrollToTop } from "@/components/ui/scroll-to-top/ScrollToTop";
// import { toast } from "react-toastify";
// import { CardSkeleton } from "@/shared/ui/skeletons/card-skeleton.tsx";
// import { TableCardSkeleton } from "@/shared/ui/skeletons/table-card-skeleton.tsx";
// import { EmptyPromosList } from "@/pages/influencer/shared/components/empty-promo-list/EmptyPromoList.tsx";
// import { TableCardSkeleton } from "@/shared/ui/skeletons/table-card-skeleton.tsx";
// import { SmallLoader } from "@components/ui/small-loader/SmallLoader.tsx";
import "./_promos-list.scss";

export const PromosList = () => {
  const { viewMode, activePromosFilter, limit } = useDashboardLayoutStore();

  console.log(activePromosFilter);

  const { data, isError, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching, isPending } =
    useInfiniteQuery({
      queryKey: ["promos", activePromosFilter, limit],
      initialPageParam: 1,
      queryFn: ({ pageParam }) =>
        getInfluencerPromos(activePromosFilter, limit, pageParam as number),

      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage || lastPage.length === 0) return undefined;
        if (lastPage.length < limit) {
          return undefined;
        }
        return allPages.length + 1;
      },
      staleTime: 1_000, // 10 seconds
      // refetchInterval: 60_000, // 1 minute
      // refetchOnWindowFocus: true,
      placeholderData: (prev) => prev,
    });

  console.log("Promos query status:", { isError, isFetching, isFetchingNextPage, hasNextPage, isPending });

  console.log("Promos data:", data);

  const activePromos = data?.pages.flat() ?? [];

  // useMemo to filter out declined promos
  // const filteredPromos = activePromos.filter(promo => promo.confirmation !== 'decline');

  // console.log('Filtered promos', filteredPromos);

  // if (true) {
  //   return (
  //     <TableCardSkeleton />
  //   );
  // }

  const isInitialLoading = isPending && !data;
  const isLoadingMore = isFetchingNextPage;
  const isRefreshing = isFetching && !isFetchingNextPage && !!data;

  if (isError) {
    return (
      <p style={{ fontSize: 48, textAlign: 'center', paddingTop: 40 }}>Error loading promos.</p>
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

          <div className="promos-list__actions">
            <ButtonMain
              label={isLoadingMore ? "Loading..." : "View more"}
              onClick={() => hasNextPage && fetchNextPage()}
              isDisabled={!hasNextPage || isLoadingMore}
            />
          </div>
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

// <EmptyPromosList
//   title={'No new promotions right now'}
//   description={'You’re all caught up. New promotions will appear here as soon as they’re available.'}
// />
