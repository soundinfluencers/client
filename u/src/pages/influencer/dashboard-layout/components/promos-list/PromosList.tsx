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
import "./_promos-list.scss";

export const PromosList = () => {
  const { viewMode, activePromosFilter, limit } = useDashboardLayoutStore();

  console.log(activePromosFilter);

  const { data, isError, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching, isPending } =
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
      staleTime: 10_000, // 10 seconds
      // refetchInterval: 60_000, // 1 minute
      // refetchOnWindowFocus: true,
    });

  console.log("Promos query status:", { isError, isLoading, isFetching, isFetchingNextPage, hasNextPage, isPending });

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

  return (
    <div className="promos-list">
      {isError ? (
        <p style={{ fontSize: 48, textAlign: 'center', paddingTop: 40 }}>Error loading promos.</p>
      ) : (
        <div className="promos-list__content">
          {viewMode === "grid" ? (
            <PromosGrid promos={activePromos} isLoading={isLoading} isFetching={isFetching} />
          ) : (
            <div className="promos-list__scroll">
              <PromosTable promos={activePromos} isLoading={isLoading} isFetching={isFetching} />
            </div>
          )}

          <div className="promos-list__actions">
            <ButtonMain
              label={isFetchingNextPage ? "Loading..." : "View more"}
              onClick={() => fetchNextPage()}
              isDisabled={!hasNextPage || isFetchingNextPage}
            />
          </div>
        </div>
      )}
    </div>
  );
};

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
