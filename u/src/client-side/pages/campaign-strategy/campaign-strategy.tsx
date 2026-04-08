import React from "react";
import "@/client-side/styles-table/campaignBase.scss";

import {
  Breadcrumbs,
  ButtonMain,
  ButtonSecondary,
  Checkbox,
  Container,
} from "@/components";
import { Modal } from "@/components/ui/modal-fix/Modal";

import { Bar, ViewAudience, ViewChange } from "@/client-side/ui";
import { LiveViewCard, TableStrategy } from "@/client-side/widgets";

import { useCampaignStrategyPage } from "./hooks/use-campaign-strategy-page";
import { useProposalShare } from "./hooks/use-proposal-share";
import {DraftButton} from "@/client-side/ui/draft-button/draft-button.tsx";

export const CampaignStrategy: React.FC = () => {
  const {
    checked,
    setChecked,
    changeView,
    setChangeView,
    view,
    setView,
    campaignName,
    groupedContent,
    mainPromos,
    musicPromos,
    otherPromos,
    groupPrices,
    saveDraft,
    goToPayment,
    isProposalModalOpen,
    campaignProposalId,
    setProposalModalOpen,
    saveProposal,
    resetCampaign,
  } = useCampaignStrategyPage();

  const {
    shareUrl,
    copyShareLink,
    openProposal,
  } = useProposalShare(campaignProposalId);
  console.log(groupedContent);
  return (
      <>
        <Container className="campaignBase">
          <div className="navmenu">
            <Breadcrumbs />
            <DraftButton onClick={saveDraft}/>
          </div>

          <div className="campaignBase__title">
            <h1>{campaignName || ""} - Campaign SoundInfluencers</h1>
          </div>

          <Bar campaign={undefined} />

          <div className="contols-strategy">
            {view === 1 && (
                <ViewAudience
                    flag={changeView}
                    onChange={() => setChangeView((prev) => !prev)}
                />
            )}
            <button onClick={saveProposal} className='contols-strategy__proposal'>
              Save as proposal
            </button>

            <ViewChange setView={setView} view={view} />

          </div>

          {view === 0 ? (
              <div className="campaignBase__wrapper live-view">
                {groupedContent.main.map((item) => (
                    <LiveViewCard
                        key={item._id}
                        item={item}
                        networks={mainPromos}
                    />
                ))}

                {groupedContent.music.map((item) => (
                    <LiveViewCard
                        key={item._id}
                        item={item}
                        networks={musicPromos}
                    />
                ))}

                {groupedContent.press.map((item) => (
                    <LiveViewCard
                        key={item._id}
                        item={item}
                        networks={otherPromos}
                    />
                ))}
              </div>
          ) : (
              <div className="campaignBase__wrapper">
                {groupedContent.main.length > 0 && (
                    <TableStrategy
                        group="main"
                        networks={mainPromos}
                        changeView={changeView}
                        title="Video Distribution"
                        items={groupedContent.main}
                        totalPrice={groupPrices.main}
                    />
                )}

                {groupedContent.music.length > 0 && (
                    <TableStrategy
                        group="music"
                        networks={musicPromos}
                        changeView={changeView}
                        title="Music Placements"
                        items={groupedContent.music}
                        totalPrice={groupPrices.music}
                    />
                )}

                {groupedContent.press.length > 0 && (
                    <TableStrategy
                        group="press"
                        networks={otherPromos}
                        changeView={changeView}
                        title="Press Coverage"
                        items={groupedContent.press}
                        totalPrice={groupPrices.press}
                    />
                )}
              </div>
          )}

          <Checkbox
              name="Allow automatic influencer replacement if a creator opts out."
              isChecked={checked}
              onChange={setChecked}
          />


          <div className="campaignBase__proceedTo">
            <ButtonMain
                text="Proceed to payment"
                onClick={goToPayment}
                className="proceedTo"
            />
          </div>
        </Container>

        {isProposalModalOpen && (
            <Modal
                onClose={() => {
                  setProposalModalOpen(false);
                  resetCampaign();
                }}
            >
              <div className="modal-proposal">
                <h2>Proposal saved</h2>

                <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    placeholder="https://test.soundinfluencers.com/promo-share/..."
                />

                <div className="modal-proposal-btn">
                  <ButtonSecondary
                      className="btn"
                      text="Copy share link"
                      onClick={copyShareLink}
                  />
                  <ButtonMain
                      className="btn"
                      text="Edit proposal"
                      onClick={openProposal}
                  />
                </div>
              </div>
            </Modal>
        )}
      </>
  );
};