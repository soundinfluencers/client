import { useDashboardLayoutStore } from "../../store/useDashboardLayoutStore";
import { PromosGrid } from "./components/promos-grid/PromosGrid";
import { PromosTable } from "./components/promos-table/PromosTable";
import { ButtonMain } from "../../../../../components/ui/buttons-fix/ButtonFix";
import { getInfluencerPromos } from "../../../../../api/influencer/promos/influencer-promos.api";
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

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    toast.error("Error loading promos.");
    return <p style={{ fontSize: 48, textAlign: 'center', paddingTop: 40 }}>Error loading promos.</p>;
  }

  if (activePromos.length === 0) {
    return (
      <p style={{ fontSize: 48, textAlign: "center", paddingTop: 40 }}>
        No promos found.
      </p>
    );
  }

  return (
    <div className="promos-list">
      <div className="promos-list__content">
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
        {/* <ScrollToTop/> */}
        {/* <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          Scroll to top
        </button> */}
      </div>
    </div>
  );
};
