import { Breadcrumbs, Container } from "@/components";

import styles from "./agency-campaign-page.module.scss";
import {
    useAgencyCampaignTabParam
} from "@/features/client-side/agency-campaign/select-agency-campaign-tab/model/use-agency-campaign-tab-param.ts";
import {
    AgencyCampaignForm
} from "@/widgets/client-side/agency-campaign/agency-campaign-form/ui/agency-campaign-form.tsx";

export const AgencyCampaignPage = () => {
    const { activeTab, setActiveTab } = useAgencyCampaignTabParam();

    return (
        <Container className={styles.root}>
            <div className={styles.header}>
                <Breadcrumbs />
            </div>

            <div className={styles.content}>
                <div className={styles.title}>
                    <h2>Agency campaign request</h2>
                    <p>Minimum budget 1000€</p>
                </div>

                <AgencyCampaignForm
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
            </div>
        </Container>
    );
};