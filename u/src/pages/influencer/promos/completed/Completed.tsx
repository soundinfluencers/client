import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDetailedPromos } from '../hooks/useDetailedPromos';

import { Breadcrumbs, Container, Loader } from '@/components';
import { PromosDetailsList } from '../components/promos-details-list/PromosDetailsList';
import { ButtonMain } from '@/components/ui/buttons-fix/ButtonFix';

import './_completed.scss';
// import type { IPromoDetailsModel } from "@/pages/influencer/promos/types/promos.types.ts";

//TODO: mb add session storage for campaignId and addedAccountsId to persist state on reload
export const Completed: React.FC = () => {
  const { state } = useLocation() as {
    state?: {
      campaignId?: string;
      addedAccountsId?: string;
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const { campaignId, addedAccountsId } = state || {};
  console.log(campaignId, addedAccountsId)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    error,
    isFetchingNextPage } = useDetailedPromos({ status: 'close', campaignId, addedAccountsId });

    console.log(data);

  const promos = data?.promos || [];

  console.log('Completed promos:', promos);

  if (isLoading) {
    return <Loader />;
  }
  if (error) {
    return <div style={{ fontSize: 48, textAlign: 'center', paddingTop: 40 }}>Error loading promos</div>;
  }
  if (promos.length === 0) {
    return <div style={{ fontSize: 48, textAlign: 'center', paddingTop: 40 }}>No completed promos found.</div>;
  }

  return (
    <Container className="completed-page">
      <Breadcrumbs />
      <div className="completed-page__wrapper">
        <PromosDetailsList
          data={promos}
          status='completed'
        />

        {!campaignId && !addedAccountsId && (
          <ButtonMain
            label={isFetchingNextPage ? 'Loading...' : 'View more'}
            onClick={() => fetchNextPage()}
            isDisabled={!hasNextPage}
          />
        )}
      </div>
    </Container>
  );
};

// export const completedClose: IPromoDetailsModel[] = [
//   {
//     campaignId: "cc_01",
//     influencerId: "infl_21",
//     addedAccountsId: "add_21",
//     socialAccountId: "soc_cc_01",
//     campaignName: "Completed Promo #1",
//     username: "completed_user_01",
//     accountSocialMedia: "instagram",
//     createdAt: "2025-12-10",
//     clientName: "Client O",
//     reward: 60,
//     postLink: "https://example.com/post/cc_01",
//     dateRequest: "2025-12-11",
//     mainLink: "https://example.com/cc_01",
//     description: "Completed promo description 1",
//     taggedUser: "@brandO",
//     taggedLink: "https://example.com/brandO",
//     additionalBrief: "Brief O1",
//     statusCampaign: "completed",
//     closedStatus: "close",
//     confirmation: "accept",
//   },
//   {
//     campaignId: "cc_02",
//     influencerId: "infl_22",
//     addedAccountsId: "add_22",
//     socialAccountId: "soc_cc_02",
//     campaignName: "Completed Promo #2",
//     username: "completed_user_02",
//     accountSocialMedia: "youtube",
//     createdAt: "2025-12-11",
//     clientName: "Client O",
//     reward: 70,
//     postLink: "https://example.com/post/cc_02",
//     dateRequest: "2025-12-12",
//     mainLink: "https://example.com/cc_02",
//     description: "Completed promo description 2",
//     taggedUser: "@brandO",
//     taggedLink: "https://example.com/brandO",
//     additionalBrief: "Brief O2",
//     statusCampaign: "completed",
//     closedStatus: "close",
//     confirmation: "accept",
//   },
//   {
//     campaignId: "cc_03",
//     influencerId: "infl_23",
//     addedAccountsId: "add_23",
//     socialAccountId: "soc_cc_03",
//     campaignName: "Completed Promo #3",
//     username: "completed_user_03",
//     accountSocialMedia: "press",
//     createdAt: "2025-12-12",
//     clientName: "Client P",
//     reward: 80,
//     postLink: "https://example.com/post/cc_03",
//     dateRequest: "2025-12-13",
//     mainLink: "https://example.com/cc_03",
//     description: "Completed promo description 3",
//     taggedUser: "@brandP",
//     taggedLink: "https://example.com/brandP",
//     additionalBrief: "Brief P1",
//     statusCampaign: "completed",
//     closedStatus: "close",
//     confirmation: "wait",
//   },
//   {
//     campaignId: "cc_04",
//     influencerId: "infl_24",
//     addedAccountsId: "add_24",
//     socialAccountId: "soc_cc_04",
//     campaignName: "Completed Promo #4",
//     username: "completed_user_04",
//     accountSocialMedia: "soundcloud",
//     createdAt: "2025-12-13",
//     clientName: "Client Q",
//     reward: 65,
//     postLink: "https://example.com/post/cc_04",
//     dateRequest: "2025-12-14",
//     mainLink: "https://example.com/cc_04",
//     description: "Completed promo description 4",
//     taggedUser: "@brandQ",
//     taggedLink: "https://example.com/brandQ",
//     additionalBrief: "Brief Q1",
//     statusCampaign: "completed",
//     closedStatus: "close",
//     confirmation: "accept",
//   },
//   {
//     campaignId: "cc_05",
//     influencerId: "infl_25",
//     addedAccountsId: "add_25",
//     socialAccountId: "soc_cc_05",
//     campaignName: "Completed Promo #5",
//     username: "completed_user_05",
//     accountSocialMedia: "spotify",
//     createdAt: "2025-12-14",
//     clientName: "Client R",
//     reward: 90,
//     postLink: "https://example.com/post/cc_05",
//     dateRequest: "2025-12-15",
//     mainLink: "https://example.com/cc_05",
//     description: "Completed promo description 5",
//     taggedUser: "@brandR",
//     taggedLink: "https://example.com/brandR",
//     additionalBrief: "Brief R1",
//     statusCampaign: "completed",
//     closedStatus: "close",
//     confirmation: "accept",
//   },
//   {
//     campaignId: "cc_06",
//     influencerId: "infl_26",
//     addedAccountsId: "add_26",
//     socialAccountId: "soc_cc_06",
//     campaignName: "Completed Promo #6",
//     username: "completed_user_06",
//     accountSocialMedia: "facebook",
//     createdAt: "2025-12-15",
//     clientName: "Client R",
//     reward: 55,
//     postLink: "https://example.com/post/cc_06",
//     dateRequest: "2025-12-16",
//     mainLink: "https://example.com/cc_06",
//     description: "Completed promo description 6",
//     taggedUser: "@brandR",
//     taggedLink: "https://example.com/brandR",
//     additionalBrief: "Brief R2",
//     statusCampaign: "completed",
//     closedStatus: "close",
//     confirmation: "accept",
//   },
//   {
//     campaignId: "cc_07",
//     influencerId: "infl_27",
//     addedAccountsId: "add_27",
//     socialAccountId: "soc_cc_07",
//     campaignName: "Completed Promo #7",
//     username: "completed_user_07",
//     accountSocialMedia: "instagram",
//     createdAt: "2025-12-16",
//     clientName: "Client S",
//     reward: 100,
//     postLink: "https://example.com/post/cc_07",
//     dateRequest: "2025-12-17",
//     mainLink: "https://example.com/cc_07",
//     description: "Completed promo description 7",
//     taggedUser: "@brandS",
//     taggedLink: "https://example.com/brandS",
//     additionalBrief: "Brief S1",
//     statusCampaign: "completed",
//     closedStatus: "close",
//     confirmation: "wait",
//   },
//   {
//     campaignId: "cc_08",
//     influencerId: "infl_28",
//     addedAccountsId: "add_28",
//     socialAccountId: "soc_cc_08",
//     campaignName: "Completed Promo #8",
//     username: "completed_user_08",
//     accountSocialMedia: "youtube",
//     createdAt: "2025-12-17",
//     clientName: "Client T",
//     reward: 85,
//     postLink: "https://example.com/post/cc_08",
//     dateRequest: "2025-12-18",
//     mainLink: "https://example.com/cc_08",
//     description: "Completed promo description 8",
//     taggedUser: "@brandT",
//     taggedLink: "https://example.com/brandT",
//     additionalBrief: "Brief T1",
//     statusCampaign: "completed",
//     closedStatus: "close",
//     confirmation: "accept",
//   },
//   {
//     campaignId: "cc_09",
//     influencerId: "infl_29",
//     addedAccountsId: "add_29",
//     socialAccountId: "soc_cc_09",
//     campaignName: "Completed Promo #9",
//     username: "completed_user_09",
//     accountSocialMedia: "press",
//     createdAt: "2025-12-18",
//     clientName: "Client U",
//     reward: 120,
//     postLink: "https://example.com/post/cc_09",
//     dateRequest: "2025-12-19",
//     mainLink: "https://example.com/cc_09",
//     description: "Completed promo description 9",
//     taggedUser: "@brandU",
//     taggedLink: "https://example.com/brandU",
//     additionalBrief: "Brief U1",
//     statusCampaign: "completed",
//     closedStatus: "close",
//     confirmation: "accept",
//   },
//   {
//     campaignId: "cc_10",
//     influencerId: "infl_30",
//     addedAccountsId: "add_30",
//     socialAccountId: "soc_cc_10",
//     campaignName: "Completed Promo #10",
//     username: "completed_user_10",
//     accountSocialMedia: "soundcloud",
//     createdAt: "2025-12-19",
//     clientName: "Client U",
//     reward: 75,
//     postLink: "https://example.com/post/cc_10",
//     dateRequest: "2025-12-20",
//     mainLink: "https://example.com/cc_10",
//     description: "Completed promo description 10",
//     taggedUser: "@brandU",
//     taggedLink: "https://example.com/brandU",
//     additionalBrief: "Brief U2",
//     statusCampaign: "completed",
//     closedStatus: "close",
//     confirmation: "accept",
//   },
// ];