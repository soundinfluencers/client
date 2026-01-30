import { useDashboardLayoutStore } from "../../store/useDashboardLayoutStore";
import { PromosGrid } from "./components/promos-grid/PromosGrid";
import { PromosTable } from "./components/promos-table/PromosTable";
import { ButtonMain } from "@components/ui/buttons-fix/ButtonFix.tsx";
import { getInfluencerPromos } from "@/api/influencer/promos/influencer-promos.api.ts";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader } from "@/components";

// import { ScrollToTop } from "@/components/ui/scroll-to-top/ScrollToTop";
import "./_promos-list.scss";
import { toast } from "react-toastify";

export const PromosList = () => {
  const { viewMode, activePromosFilter, limit } = useDashboardLayoutStore();

  console.log(activePromosFilter);

  const { data, error, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
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
    });

  console.log("Promos data:", data);

  const activePromos = data?.pages.flat() ?? [];

  // useMemo to filter out declined promos
  const filteredPromos = activePromos.filter(promo => promo.confirmation !== 'decline');

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    toast.error("Error loading promos.");
    return <p style={{ fontSize: 48, textAlign: 'center', paddingTop: 40 }}>Error loading promos.</p>;
  }

  if (filteredPromos.length === 0) {
    return (
      <p style={{ fontSize: 48, textAlign: "center", paddingTop: 40 }}>
        No promos found.
      </p>
    );
  }

  console.log('Filtered promos', filteredPromos);

  return (
    <div className="promos-list">
      <div className="promos-list__content">
        {viewMode === "grid" ? (
          <PromosGrid promos={filteredPromos} />
        ) : (
          <div className="promos-list__scroll">
            <PromosTable promos={filteredPromos} />
          </div>
        )}

        <div className="promos-list__actions">
          <ButtonMain
            label={isFetchingNextPage ? "Loading..." : "View more"}
            onClick={() => fetchNextPage()}
            isDisabled={!hasNextPage || isFetchingNextPage}
          />
        </div>
        {/* <ScrollToTop/> */}
        {/* <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          Scroll to top
        </button> */}
      </div>
    </div>
  );
};
