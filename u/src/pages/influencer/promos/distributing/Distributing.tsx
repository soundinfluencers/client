import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDetailedPromos } from '../hooks/useDetailedPromos';
import { PromosDetailsList } from '../components/promos-details-list/PromosDetailsList';
import { CampaignResultForm } from './components/campaign-result-form/CampaignResultForm';
import { ButtonMain } from '@/components/ui/buttons-fix/ButtonFix';
import { Breadcrumbs, Container, Loader } from '@/components';
import { EmptyPromosList } from "@/pages/influencer/shared/components/empty-promo-list/EmptyPromoList.tsx";
import {
  isSubmitOpen,
  isSubmitState,
  type DistributingNavState,
  type SubmitResultsNavState,
} from './components/campaign-result-form/utils/distributing-nav.helper';
import type { IPromoDetailsModel } from '../types/promos.types';

import './_distributing.scss';

//TODO: mb add session storage for campaignId and addedAccountsId to persist state on reload
export const Distributing: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const isFormOpen = isSubmitOpen(location.hash);

  const isSubmit = isSubmitState(location.state);
  const submitState = isSubmit ? (location.state as SubmitResultsNavState) : null;

  const [pagesIds, setPagesIds] = useState<DistributingNavState>({
    campaignId: undefined,
    addedAccountsId: undefined,
  });

  useEffect(() => {
    if (isSubmit) return;

    const distributingState = (location.state as DistributingNavState | null) ?? null;
    const next = {
      campaignId: distributingState?.campaignId,
      addedAccountsId: distributingState?.addedAccountsId,
    };

    setPagesIds((prev) =>
      prev.campaignId === next.campaignId && prev.addedAccountsId === next.addedAccountsId
        ? prev
        : next,
    );
  }, [location.state, isSubmit]);

  const { campaignId, addedAccountsId } = pagesIds;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    error,
    isFetchingNextPage,
  } = useDetailedPromos({ status: 'ongoing', campaignId, addedAccountsId });

  const promos = data?.promos || [];

  useEffect(() => {
    if (isFormOpen && !submitState) {
      navigate({ pathname: location.pathname, hash: '' }, { replace: true });
    }
  }, [isFormOpen, submitState, navigate, location.pathname, addedAccountsId, campaignId]);

  const openFormScreen = (promo: IPromoDetailsModel) => {
    const nextState: SubmitResultsNavState = {
      campaignId: promo.campaignId,
      addedAccountsId: promo.addedAccountsId,
      username: promo.username,
      meta: promo.accountSocialMedia,

      from: { campaignId, addedAccountsId },
    };
    navigate({ pathname: location.pathname, hash: 'submit' }, { state: nextState });
  };

  // const d = useMemo(() => {
  //   if (campaignId && addedAccountsId) {
  //     return ongoingAccept.filter(
  //       (promo) =>
  //         promo.campaignId === campaignId && promo.socialAccountId === addedAccountsId,
  //     );
  //   }
  //   return ongoingAccept;
  // }, [campaignId, addedAccountsId]);

  // console.log("Distributing page data:", { campaignId, addedAccountsId, data: d });

  if (isLoading) {
    return <Loader/>;
  }

  if (error) {
    return <div style={{ fontSize: 48, textAlign: 'center', paddingTop: 40 }}>Error loading promos</div>;
  }

  if (promos.length === 0) {
    return (
      <EmptyPromosList
        title={'No promos yet'}
        description={'Once you have promos, they will appear here.'}
      />
    );
  }

  console.log('Distributing promos:', promos);

  return (
    <Container className="distributing-page">
      <Breadcrumbs/>
      {isFormOpen && submitState ? (
        <CampaignResultForm
          submitState={submitState}
        />
      ) : (
        <div className="distributing-page__wrapper">
          <PromosDetailsList
            data={promos}
            status="distributing"
            onSubmitResults={openFormScreen}
          />

          {!campaignId && !addedAccountsId && (
            <ButtonMain
              label={isFetchingNextPage ? 'Loading...' : 'View more'}
              onClick={() => fetchNextPage()}
              isDisabled={!hasNextPage}
            />
          )}
        </div>
      )}
    </Container>
  );
};

// export const ongoingAccept: IPromoDetailsModel[] = [
//   {
//     campaignId: "oa_01",
//     influencerId: "infl_11",
//     addedAccountsId: "add_11",
//     socialAccountId: "soc_oa_01",
//     campaignName: "Ongoing Promo #1",
//     username: "ongoing_user_01",
//     accountSocialMedia: "instagram",
//     createdAt: "2026-01-15",
//     clientName: "Client H",
//     reward: 50,
//     postLink: "https://example.com/post/oa_01",
//     dateRequest: "2026-01-16",
//     mainLink: "https://example.com/oa_01",
//     description: "Ongoing promo description 1",
//     taggedUser: "@brandH",
//     taggedLink: "https://example.com/brandH",
//     additionalBrief: "Brief H1",
//     statusCampaign: "distributing",
//     closedStatus: "wait",
//     confirmation: "accept",
//   },
//   {
//     campaignId: "oa_02",
//     influencerId: "infl_12",
//     addedAccountsId: "add_12",
//     socialAccountId: "soc_oa_02",
//     campaignName: "Ongoing Promo #2",
//     username: "ongoing_user_02",
//     accountSocialMedia: "tiktok",
//     createdAt: "2026-01-16",
//     clientName: "Client H",
//     reward: 55,
//     postLink: "https://example.com/post/oa_02",
//     dateRequest: "2026-01-17",
//     mainLink: "https://example.com/oa_02",
//     description: "Ongoing promo description 2",
//     taggedUser: "@brandH",
//     taggedLink: "https://example.com/brandH",
//     additionalBrief: "Brief H2",
//     statusCampaign: "distributing",
//     closedStatus: "wait",
//     confirmation: "accept",
//   },
//   {
//     campaignId: "oa_03",
//     influencerId: "infl_13",
//     addedAccountsId: "add_13",
//     socialAccountId: "soc_oa_03",
//     campaignName: "Ongoing Promo #3",
//     username: "ongoing_user_03",
//     accountSocialMedia: "youtube",
//     createdAt: "2026-01-17",
//     clientName: "Client I",
//     reward: 60,
//     postLink: "https://example.com/post/oa_03",
//     dateRequest: "2026-01-18",
//     mainLink: "https://example.com/oa_03",
//     description: "Ongoing promo description 3",
//     taggedUser: "@brandI",
//     taggedLink: "https://example.com/brandI",
//     additionalBrief: "Brief I1",
//     statusCampaign: "distributing",
//     closedStatus: "wait",
//     confirmation: "accept",
//   },
//   {
//     campaignId: "oa_04",
//     influencerId: "infl_14",
//     addedAccountsId: "add_14",
//     socialAccountId: "soc_oa_04",
//     campaignName: "Ongoing Promo #4",
//     username: "ongoing_user_04",
//     accountSocialMedia: "facebook",
//     createdAt: "2026-01-18",
//     clientName: "Client J",
//     reward: 65,
//     postLink: "https://example.com/post/oa_04",
//     dateRequest: "2026-01-19",
//     mainLink: "https://example.com/oa_04",
//     description: "Ongoing promo description 4",
//     taggedUser: "@brandJ",
//     taggedLink: "https://example.com/brandJ",
//     additionalBrief: "Brief J1",
//     statusCampaign: "distributing",
//     closedStatus: "wait",
//     confirmation: "accept",
//   },
//   {
//     campaignId: "oa_05",
//     influencerId: "infl_15",
//     addedAccountsId: "add_15",
//     socialAccountId: "soc_oa_05",
//     campaignName: "Ongoing Promo #5",
//     username: "ongoing_user_05",
//     accountSocialMedia: "spotify",
//     createdAt: "2026-01-19",
//     clientName: "Client J",
//     reward: 70,
//     postLink: "https://example.com/post/oa_05",
//     dateRequest: "2026-01-20",
//     mainLink: "https://example.com/oa_05",
//     description: "Ongoing promo description 5",
//     taggedUser: "@brandJ",
//     taggedLink: "https://example.com/brandJ",
//     additionalBrief: "Brief J2",
//     statusCampaign: "distributing",
//     closedStatus: "wait",
//     confirmation: "accept",
//   },
//   {
//     campaignId: "oa_06",
//     influencerId: "infl_16",
//     addedAccountsId: "add_16",
//     socialAccountId: "soc_oa_06",
//     campaignName: "Ongoing Promo #6",
//     username: "ongoing_user_06",
//     accountSocialMedia: "press",
//     createdAt: "2026-01-20",
//     clientName: "Client K",
//     reward: 75,
//     postLink: "https://example.com/post/oa_06",
//     dateRequest: "2026-01-21",
//     mainLink: "https://example.com/oa_06",
//     description: "Ongoing promo description 6",
//     taggedUser: "@brandK",
//     taggedLink: "https://example.com/brandK",
//     additionalBrief: "Brief K1",
//     statusCampaign: "distributing",
//     closedStatus: "wait",
//     confirmation: "accept",
//   },
//   {
//     campaignId: "oa_07",
//     influencerId: "infl_17",
//     addedAccountsId: "add_17",
//     socialAccountId: "soc_oa_07",
//     campaignName: "Ongoing Promo #7",
//     username: "ongoing_user_07",
//     accountSocialMedia: "soundcloud",
//     createdAt: "2026-01-21",
//     clientName: "Client L",
//     reward: 80,
//     postLink: "https://example.com/post/oa_07",
//     dateRequest: "2026-01-22",
//     mainLink: "https://example.com/oa_07",
//     description: "Ongoing promo description 7",
//     taggedUser: "@brandL",
//     taggedLink: "https://example.com/brandL",
//     additionalBrief: "Brief L1",
//     statusCampaign: "distributing",
//     closedStatus: "wait",
//     confirmation: "accept",
//   },
//   {
//     campaignId: "oa_08",
//     influencerId: "infl_18",
//     addedAccountsId: "add_18",
//     socialAccountId: "soc_oa_08",
//     campaignName: "Ongoing Promo #8",
//     username: "ongoing_user_08",
//     accountSocialMedia: "instagram",
//     createdAt: "2026-01-22",
//     clientName: "Client M",
//     reward: 85,
//     postLink: "https://example.com/post/oa_08",
//     dateRequest: "2026-01-23",
//     mainLink: "https://example.com/oa_08",
//     description: "Ongoing promo description 8",
//     taggedUser: "@brandM",
//     taggedLink: "https://example.com/brandM",
//     additionalBrief: "Brief M1",
//     statusCampaign: "distributing",
//     closedStatus: "wait",
//     confirmation: "accept",
//   },
//   {
//     campaignId: "oa_09",
//     influencerId: "infl_19",
//     addedAccountsId: "add_19",
//     socialAccountId: "soc_oa_09",
//     campaignName: "Ongoing Promo #9",
//     username: "ongoing_user_09",
//     accountSocialMedia: "tiktok",
//     createdAt: "2026-01-23",
//     clientName: "Client N",
//     reward: 90,
//     postLink: "https://example.com/post/oa_09",
//     dateRequest: "2026-01-24",
//     mainLink: "https://example.com/oa_09",
//     description: "Ongoing promo description 9",
//     taggedUser: "@brandN",
//     taggedLink: "https://example.com/brandN",
//     additionalBrief: "Brief N1",
//     statusCampaign: "distributing",
//     closedStatus: "wait",
//     confirmation: "accept",
//   },
//   {
//     campaignId: "oa_10",
//     influencerId: "infl_20",
//     addedAccountsId: "add_20",
//     socialAccountId: "soc_oa_10",
//     campaignName: "Ongoing Promo #10",
//     username: "ongoing_user_10",
//     accountSocialMedia: "youtube",
//     createdAt: "2026-01-24",
//     clientName: "Client N",
//     reward: 95,
//     postLink: "https://example.com/post/oa_10",
//     dateRequest: "2026-01-25",
//     mainLink: "https://example.com/oa_10",
//     description: "Ongoing promo description 10",
//     taggedUser: "@brandN",
//     taggedLink: "https://example.com/brandN",
//     additionalBrief: "Brief N2",
//     statusCampaign: "distributing",
//     closedStatus: "wait",
//     confirmation: "accept",
//   },
// ];