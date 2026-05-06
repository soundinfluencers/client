import { Container, ButtonMain } from "@/components";
import { useUser } from "@/store/get-user";
import { useDashboardCampaigns } from "../model/use-dashboard-campaigns";
import { useDashboardCampaignOpen } from "../model/use-dashboard-campaign-open";
import styles from "./dashboard.module.scss";
import {DashboardHeader} from "@/widgets/client-side/dashboard/dashboard-header/ui/dashboard-header.tsx";
import {DashboardToolbar} from "@/widgets/client-side/dashboard/dashboard-toolbar/ui/dashboard-toolbar.tsx";
import {
    DashboardCampaignsList
} from "@/widgets/client-side/dashboard/dashboard-campaigns-list/ui/dashboard-campaigns-list.tsx";

export const DashboardPage = () => {
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
            <Container className={styles.root}>
                <DashboardHeader balance={user?.balance} firstName={user?.firstName} />
                <div className={styles.error}>
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
        <Container className={styles.root}>
            <DashboardHeader balance={user?.balance} firstName={user?.firstName} />

            <DashboardToolbar
                status={filterStatus}
                onStatusChange={setStatus}
                view={view}
                onViewChange={setView}
            />

            <DashboardCampaignsList
                isLoading={isLoading}
                listDisplayMode={view}
                list={campaigns}
                onOpen={openCampaign}
            />

            {hasMore ? (
                <ButtonMain
                    className={styles.viewMoreButton}
                    text={isFetchingNextPage ? "Loading..." : "View more"}
                    onClick={loadMore}
                    isDisabled={isFetchingNextPage}
                />
            ) : (
                <div className={styles.spacer} />
            )}
        </Container>
    );
};