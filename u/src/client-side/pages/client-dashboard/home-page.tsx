import "./_home-page.scss";
import { Container, ButtonMain } from "@/components";
import { useUser } from "@/store/get-user";
import { BarDashboard, CampaignsList, HomeHeader } from "@/client-side/widgets";
import {useDashboardCampaigns} from "./hooks/use-dashboard-campaigns.ts";
import {useDashboardCampaignOpen} from "./hooks/use-campaign-open.ts";


export const HomePage = () => {
    const { user } = useUser();
    const openCampaign = useDashboardCampaignOpen();

    const {
        view,
        setView,
        filterStatus,
        setStatus,
        campaigns,
        isError,
        isLoading,
        isFetchingNextPage,
        refetch,
        hasMore,
        loadMore,
    } = useDashboardCampaigns();

    if (isError) {
        return (
            <Container className="home-page">
                <HomeHeader balance={user?.balance} firstName={user?.firstName} />
                <div className="home-page__error">
                    <p>Error loading campaigns</p>
                    <ButtonMain
                        text={isLoading ? "Refreshing..." : "Retry"}
                        onClick={() => refetch()}
                    />
                </div>
            </Container>
        );
    }

    return (
        <Container className="home-page">
            <HomeHeader balance={user?.balance} firstName={user?.firstName} />

            <BarDashboard
                status={filterStatus}
                onStatusChange={setStatus}
                view={view}
                setView={setView}
            />

            <CampaignsList
                isLoading={isLoading}
                listDisplayMode={view}
                list={campaigns}
                onOpen={openCampaign}
            />

            {hasMore ? (
                <ButtonMain
                    className="button-view-more"
                    text={isFetchingNextPage ? "Loading..." : "View more"}
                    onClick={loadMore}
                    isDisabled={isFetchingNextPage}
                />
            ) : (
                <div className="mt" />
            )}
        </Container>
    );
};