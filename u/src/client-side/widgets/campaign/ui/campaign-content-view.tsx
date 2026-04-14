import React from "react";
import "@/client-side/styles-table/_table-campaign.scss";

import { LiveViewCard } from "../live-view-card/live-view";
import { LiveViewCardInsight } from "../live-view-card/live-view-card-insight";
import { TableProposal } from "../tables/table-proposal";
import { TableStrategy } from "../tables/table-strategy";
import { TableDraft } from "../tables/table-draft";
import { TableDistributingInsight } from "../tables/table-insight";

import { useCampaignContentData } from "../model/use-campaign-content-data";

type Props = {
    campaign: any;
    view: number;
    changeView?: boolean;
    flag?: boolean;
};

export const CampaignContentView: React.FC<Props> = ({
                                                         campaign,
                                                         view,
                                                         changeView = false,
                                                         flag = true,
                                                     }) => {
    const {
        kind,
        campaignId,
        byGroup,
        groupPrices,
        config,
        accounts,
        mainPromos,
        musicPromos,
        otherPromos,
    } = useCampaignContentData({
        campaign,
        view,
        flag,
    });
    console.log("mainPromos", mainPromos);
    console.log("bugroup", byGroup);
    console.log("campaign", campaign);
    const renderLiveCards = () => (
        <div className="live-view-wrapper">
            {byGroup.main.map((item) => (
                <LiveViewCard
                    key={item._id}
                    item={item}
                    networks={mainPromos}
                    canEdit={config.liveCanEdit}
                />
            ))}

            {byGroup.music.map((item) => (
                <LiveViewCard
                    key={item._id}
                    item={item}
                    networks={musicPromos}
                    canEdit={config.liveCanEdit}
                />
            ))}

            {byGroup.press.map((item) => (
                <LiveViewCard
                    key={item._id}
                    item={item}
                    networks={otherPromos}
                    canEdit={config.liveCanEdit}
                />
            ))}
        </div>
    );

    const renderProposalTables = () => (
        <div className="table-wrapper">
            {byGroup.main.length >= 1 && (
                <TableProposal
                    optionIndex={campaign?.selectedOption?.optionIndex ?? 0}
                    totalPrice={groupPrices.main}
                    items={byGroup.main}
                    networks={mainPromos}
                    group="main"
                    canEdit={config.canEdit}
                    changeView={changeView}
                    title="Video Distribution"
                />
            )}

            {byGroup.music.length >= 1 && (
                <TableProposal
                    optionIndex={campaign?.selectedOption?.optionIndex ?? 0}
                    totalPrice={groupPrices.music}
                    items={byGroup.music}
                    networks={musicPromos}
                    group="music"
                    canEdit={config.canEdit}
                    changeView={changeView}
                    title="Music Placements"
                />
            )}

            {byGroup.press.length >= 1 && (
                <TableProposal
                    optionIndex={campaign?.selectedOption?.optionIndex ?? 0}
                    totalPrice={groupPrices.press}
                    items={byGroup.press}
                    networks={otherPromos}
                    group="press"
                    canEdit={config.canEdit}
                    changeView={changeView}
                    title="Press Coverage"
                />
            )}
        </div>
    );

    const renderStrategyTables = () => (
        <div className="table-wrapper">
            {byGroup.main.length >= 1 && (
                <TableStrategy
                    campaignId={campaignId}
                    totalPrice={groupPrices.main}
                    items={byGroup.main}
                    networks={mainPromos}
                    group="main"
                    canEdit={config.canEdit}
                    title="Video Distribution"
                    status={campaign.status}
                />
            )}

            {byGroup.music.length >= 1 && (
                <TableStrategy
                    campaignId={campaignId}
                    totalPrice={groupPrices.music}
                    items={byGroup.music}
                    networks={musicPromos}
                    group="music"
                    canEdit={config.canEdit}
                    title="Music Placements"
                    status={campaign.status}
                />
            )}

            {byGroup.press.length >= 1 && (
                <TableStrategy
                    campaignId={campaignId}
                    totalPrice={groupPrices.press}
                    items={byGroup.press}
                    networks={otherPromos}
                    group="press"
                    canEdit={config.canEdit}
                    title="Press Coverage"
                    status={campaign.status}
                />
            )}
        </div>
    );

    const renderDraftTables = () => (
        <div className="table-wrapper">
            {byGroup.main.length >= 1 && (
                <TableDraft
                    campaignId={campaignId}
                    totalPrice={groupPrices.main}
                    items={byGroup.main}
                    networks={mainPromos}
                    group="main"
                    canEdit={config.canEdit}
                    title="Video Distribution"
                    changeView={changeView}
                />
            )}

            {byGroup.music.length >= 1 && (
                <TableDraft
                    campaignId={campaignId}
                    totalPrice={groupPrices.music}
                    items={byGroup.music}
                    networks={musicPromos}
                    group="music"
                    canEdit={config.canEdit}
                    title="Music Placements"
                    changeView={changeView}
                />
            )}

            {byGroup.press.length >= 1 && (
                <TableDraft
                    campaignId={campaignId}
                    totalPrice={groupPrices.press}
                    items={byGroup.press}
                    networks={otherPromos}
                    group="press"
                    canEdit={config.canEdit}
                    title="Press Coverage"
                    changeView={changeView}
                />
            )}
        </div>
    );

    if (kind === "proposal") {
        return <div className="table-page">{view === 2 ? renderLiveCards() : renderProposalTables()}</div>;
    }

    if (kind === "regular") {
        return (
            <div className="table-page">
                {view === 0 ? (
                    <>
                        {flag ? (
                            renderLiveCards()
                        ) : (
                            <div className="live-view-wrapper">
                                {accounts.map((item, i) => (
                                    <LiveViewCardInsight key={item?._id ?? item?.accountId ?? i} campaign={campaign} item={item} />
                                ))}
                            </div>
                        )}
                    </>
                ) : flag ? (
                    renderStrategyTables()
                ) : (
                    <div className="table-wrapper">
                        <TableDistributingInsight campaign={campaign} />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="table-page">
            <div className="table-scroll">
                {view === 0 ? renderLiveCards() : renderDraftTables()}
            </div>
        </div>
    );
};