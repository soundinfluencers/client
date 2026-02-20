import { useConfirmInfluencerPromo } from './hooks/useConfirmInfluencerPromo';
import { useInfluencerNewPromos } from './hooks/useInfluencerNewPromos';
import { useEffect, useState } from 'react';
import { PromosDetailsList } from '../components/promos-details-list/PromosDetailsList';
import { Modal } from '@components/ui/modal-fix/Modal.tsx';
import { Breadcrumbs, Container, Loader } from '@/components';
import { ButtonMain } from '@components/ui/buttons-fix/ButtonFix.tsx';
import successIcon from '@/assets/icons/success-icon.svg';
// import type { IPromoDetailsModel } from "@/pages/influencer/promos/types/promos.types.ts";
import './_new-promos.scss';
import { EmptyPromosList } from "@/pages/influencer/shared/components/empty-promo-list/EmptyPromoList.tsx";

export const NewPromos = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDecline, setIsDecline] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const { data: promos = [], isLoading, error: fetchError } = useInfluencerNewPromos();
  const { mutate: confirmPromo, isPending, variables } = useConfirmInfluencerPromo();

  if (isLoading) {
    return <Loader/>;
  }

  if (fetchError) {
    return <div style={{ fontSize: 48, textAlign: 'center', paddingTop: 40 }}>Error loading promos</div>;
  }

  if (promos.length === 0) {
    return (
      <EmptyPromosList
        title={'No new promotions right now'}
        description={'You’re all caught up. New promotions will appear here as soon as they’re available.'}
      />
    );
  }

  return (
    <Container className="new-promos">
      <Breadcrumbs/>
      <div className="new-promos__quantity">
        <p className="new-promos__label">New promos</p>
        <span className="new-promos__number">{promos.length}</span>
      </div>
      <PromosDetailsList
        data={promos}
        status="pending"
        onAccept={(payload) => {
          confirmPromo(payload, {
            onSuccess: () => {
              setIsDecline(false);
              setIsAccepted(true);
              setIsModalOpen(true);
            },
          });
        }}
        onDecline={(payload) => {
          confirmPromo(payload, {
            onSuccess: () => {
              setIsAccepted(false);
              setIsDecline(true);
              setIsModalOpen(true);
            },
          });
        }}
        mutationState={{
          isPending,
          variables,
        }}
      />

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <div className="new-promos__modal">
            {isAccepted && <img className="new-promos__modal-image" src={successIcon} alt="Success"/>}
            <div className="new-promos__modal-header">
              <h2 className="new-promos__modal-title">{isAccepted ? 'Congratulations!' : 'Promo Declined'}</h2>
              <div className="new-promos__modal-description">
                {isAccepted && (
                  <>
                    <p className="new-promos__modal-subtitle">The promo is now marked as distributing - you can see it
                      in the home page.</p>
                    <p className="new-promos__modal-text">Please proceed from there to complete the content distribution
                      process.</p>
                  </>
                )}

                {isDecline && (
                  <>
                    <p className="new-promos__modal-subtitle">The campaign has been marked as declined and permanently
                      removed from your profile.</p>
                    <p className="new-promos__modal-text">If this was a mistake, please contact support.</p>
                  </>
                )}
              </div>
            </div>
            <ButtonMain label="Ok" onClick={() => setIsModalOpen(false)}/>
          </div>
        </Modal>
      )}
    </Container>
  );
}

// export const pendingWait: IPromoDetailsModel[] = [
//   {
//     campaignId: "pw_01",
//     influencerId: "infl_01",
//     addedAccountsId: "add_01",
//     socialAccountId: "soc_pw_01",
//     campaignName: "Pending Promo #1",
//     username: "pending_user_01",
//     accountSocialMedia: "instagram",
//     createdAt: "2026-02-01",
//     clientName: "Client A",
//     reward: 30,
//     postLink: "",
//     dateRequest: "2026-02-02",
//     mainLink: "https://example.com/pw_01",
//     description: "Pending promo description 1",
//     taggedUser: "@brandA",
//     taggedLink: "https://example.com/brandA",
//     additionalBrief: "Brief A1",
//     statusCampaign: "pending",
//     closedStatus: "wait",
//     confirmation: "wait",
//   },
//   {
//     campaignId: "pw_02",
//     influencerId: "infl_02",
//     addedAccountsId: "add_02",
//     socialAccountId: "soc_pw_02",
//     campaignName: "Pending Promo #2",
//     username: "pending_user_02",
//     accountSocialMedia: "tiktok",
//     createdAt: "2026-02-02",
//     clientName: "Client A",
//     reward: 35,
//     postLink: "",
//     dateRequest: "2026-02-03",
//     mainLink: "https://example.com/pw_02",
//     description: "Pending promo description 2",
//     taggedUser: "@brandA",
//     taggedLink: "https://example.com/brandA",
//     additionalBrief: "Brief A2",
//     statusCampaign: "pending",
//     closedStatus: "wait",
//     confirmation: "wait",
//   },
//   {
//     campaignId: "pw_03",
//     influencerId: "infl_03",
//     addedAccountsId: "add_03",
//     socialAccountId: "soc_pw_03",
//     campaignName: "Pending Promo #3",
//     username: "pending_user_03",
//     accountSocialMedia: "youtube",
//     createdAt: "2026-02-03",
//     clientName: "Client B",
//     reward: 40,
//     postLink: "",
//     dateRequest: "2026-02-04",
//     mainLink: "https://example.com/pw_03",
//     description: "Pending promo description 3",
//     taggedUser: "@brandB",
//     taggedLink: "https://example.com/brandB",
//     additionalBrief: "Brief B1",
//     statusCampaign: "pending",
//     closedStatus: "wait",
//     confirmation: "wait",
//   },
//   {
//     campaignId: "pw_04",
//     influencerId: "infl_04",
//     addedAccountsId: "add_04",
//     socialAccountId: "soc_pw_04",
//     campaignName: "Pending Promo #4",
//     username: "pending_user_04",
//     accountSocialMedia: "spotify",
//     createdAt: "2026-02-04",
//     clientName: "Client C",
//     reward: 45,
//     postLink: "",
//     dateRequest: "2026-02-05",
//     mainLink: "https://example.com/pw_04",
//     description: "Pending promo description 4",
//     taggedUser: "@brandC",
//     taggedLink: "https://example.com/brandC",
//     additionalBrief: "Brief C1",
//     statusCampaign: "pending",
//     closedStatus: "wait",
//     confirmation: "wait",
//   },
//   {
//     campaignId: "pw_05",
//     influencerId: "infl_05",
//     addedAccountsId: "add_05",
//     socialAccountId: "soc_pw_05",
//     campaignName: "Pending Promo #5",
//     username: "pending_user_05",
//     accountSocialMedia: "facebook",
//     createdAt: "2026-02-05",
//     clientName: "Client C",
//     reward: 50,
//     postLink: "",
//     dateRequest: "2026-02-06",
//     mainLink: "https://example.com/pw_05",
//     description: "Pending promo description 5",
//     taggedUser: "@brandC",
//     taggedLink: "https://example.com/brandC",
//     additionalBrief: "Brief C2",
//     statusCampaign: "pending",
//     closedStatus: "wait",
//     confirmation: "wait",
//   },
//   {
//     campaignId: "pw_06",
//     influencerId: "infl_06",
//     addedAccountsId: "add_06",
//     socialAccountId: "soc_pw_06",
//     campaignName: "Pending Promo #6",
//     username: "pending_user_06",
//     accountSocialMedia: "press",
//     createdAt: "2026-02-06",
//     clientName: "Client D",
//     reward: 55,
//     postLink: "",
//     dateRequest: "2026-02-07",
//     mainLink: "https://example.com/pw_06",
//     description: "Pending promo description 6",
//     taggedUser: "@brandD",
//     taggedLink: "https://example.com/brandD",
//     additionalBrief: "Brief D1",
//     statusCampaign: "pending",
//     closedStatus: "wait",
//     confirmation: "wait",
//   },
//   {
//     campaignId: "pw_07",
//     influencerId: "infl_07",
//     addedAccountsId: "add_07",
//     socialAccountId: "soc_pw_07",
//     campaignName: "Pending Promo #7",
//     username: "pending_user_07",
//     accountSocialMedia: "soundcloud",
//     createdAt: "2026-02-07",
//     clientName: "Client E",
//     reward: 60,
//     postLink: "",
//     dateRequest: "2026-02-08",
//     mainLink: "https://example.com/pw_07",
//     description: "Pending promo description 7",
//     taggedUser: "@brandE",
//     taggedLink: "https://example.com/brandE",
//     additionalBrief: "Brief E1",
//     statusCampaign: "pending",
//     closedStatus: "wait",
//     confirmation: "wait",
//   },
//   {
//     campaignId: "pw_08",
//     influencerId: "infl_08",
//     addedAccountsId: "add_08",
//     socialAccountId: "soc_pw_08",
//     campaignName: "Pending Promo #8",
//     username: "pending_user_08",
//     accountSocialMedia: "instagram",
//     createdAt: "2026-02-08",
//     clientName: "Client F",
//     reward: 65,
//     postLink: "",
//     dateRequest: "2026-02-09",
//     mainLink: "https://example.com/pw_08",
//     description: "Pending promo description 8",
//     taggedUser: "@brandF",
//     taggedLink: "https://example.com/brandF",
//     additionalBrief: "Brief F1",
//     statusCampaign: "pending",
//     closedStatus: "wait",
//     confirmation: "wait",
//   },
//   {
//     campaignId: "pw_09",
//     influencerId: "infl_09",
//     addedAccountsId: "add_09",
//     socialAccountId: "soc_pw_09",
//     campaignName: "Pending Promo #9",
//     username: "pending_user_09",
//     accountSocialMedia: "tiktok",
//     createdAt: "2026-02-09",
//     clientName: "Client F",
//     reward: 70,
//     postLink: "",
//     dateRequest: "2026-02-10",
//     mainLink: "https://example.com/pw_09",
//     description: "Pending promo description 9",
//     taggedUser: "@brandF",
//     taggedLink: "https://example.com/brandF",
//     additionalBrief: "Brief F2",
//     statusCampaign: "pending",
//     closedStatus: "wait",
//     confirmation: "wait",
//   },
//   {
//     campaignId: "pw_10",
//     influencerId: "infl_10",
//     addedAccountsId: "add_10",
//     socialAccountId: "soc_pw_10",
//     campaignName: "Pending Promo #10",
//     username: "pending_user_10",
//     accountSocialMedia: "youtube",
//     createdAt: "2026-02-10",
//     clientName: "Client G",
//     reward: 75,
//     postLink: "",
//     dateRequest: "2026-02-11",
//     mainLink: "https://example.com/pw_10",
//     description: "Pending promo description 10",
//     taggedUser: "@brandG",
//     taggedLink: "https://example.com/brandG",
//     additionalBrief: "Brief G1",
//     statusCampaign: "pending",
//     closedStatus: "wait",
//     confirmation: "wait",
//   },
// ];
