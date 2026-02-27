// import { useInfiniteQuery } from '@tanstack/react-query';
import { useDashboardLayoutStore } from '../../store/useDashboardLayoutStore';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getCampaignHistory } from '@/api/influencer/campaign-history/campaign-history.api';
import { ButtonMain } from '@components/ui/buttons-fix/ButtonFix.tsx';
import { CampaignHistoryTable } from './components/campaign-history-table/CampaignHistoryTable';
// import { Loader } from '@/components';
// import type {
//   Campaign
// } from "@/pages/influencer/dashboard-layout/components/campaign-history-list/types/campaign-history.types.ts";
import './_campaign-history-list.scss';

export const CampaignHistoryList = () => {
  const { activeCampaignHistoryFilter, limit } = useDashboardLayoutStore();

  const {
    data,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["campaign-history", activeCampaignHistoryFilter, limit],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getCampaignHistory(pageParam as number, limit),

    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length === 0) return undefined;
      if (lastPage.length < limit) {
        return undefined;
      }
      return allPages.length + 1;
    },
  });

  console.log("Campaign history data:", data);

  const campaigns = data?.pages.flat() ?? [];

  const isInitialLoading = isPending && !data;
  const isLoadingMore = isFetchingNextPage;

  // if (isLoading) {
  //   return <Loader/>;
  // }
  // if (error) {
  //   return (
  //     <p style={{ fontSize: 40, textAlign: "center", paddingTop: 40 }}>
  //       Error loading campaign history.
  //     </p>
  //   );
  // }
  // if (campaigns.length === 0) {
  //   return (
  //     <p style={{ fontSize: 40, textAlign: "center", paddingTop: 40 }}>
  //       No campaign history available.
  //     </p>
  //   );
  // }

  if (isError) {
    return  (
      <p style={{ fontSize: 40, textAlign: "center", paddingTop: 40 }}>
        Error loading campaign history.
      </p>
    )
  }

  return (
    <div className="campaign-history-list">
      <div className="campaign-history-list__content">
        <div className="campaign-history-list__scroll">
          <CampaignHistoryTable campaigns={campaigns} isInitialLoading={isInitialLoading} />
        </div>

        <div className="campaign-history-list__actions">
          <ButtonMain
            label={isLoadingMore ? "Loading..." : "View more"}
            onClick={() => hasNextPage && fetchNextPage()}
            isDisabled={!hasNextPage || isLoadingMore}
          />
        </div>
      </div>
    </div>
  );
};

// : campaigns.length === 0 ? (
//   <p style={{ fontSize: 40, textAlign: "center", paddingTop: 40 }}>
//     No campaign history available.
//   </p>
// )

// isLoading ? (
//   <Loader/>
// ) :

// export enum HistoryCampaignActionStatus {
//   pending = 0,
//   inDistribution = 1,
//   insightsSubmitted = 2,
//   invoiceSubmitted = 3,
//   paid = 4,
//   denied = 5,
// }
//
// export const HistoryCampaignActionStatusLabel: Record<
//   HistoryCampaignActionStatus,
//   string
// > = {
//   [HistoryCampaignActionStatus.pending]: "Pending",
//   [HistoryCampaignActionStatus.inDistribution]: "In Distribution",
//   [HistoryCampaignActionStatus.insightsSubmitted]: "Insights Submitted",
//   [HistoryCampaignActionStatus.invoiceSubmitted]: "Invoice Submitted",
//   [HistoryCampaignActionStatus.paid]: "Paid",
//   [HistoryCampaignActionStatus.denied]: "Denied",
// };
//
// export const historyCampaigns = [
//   // -------- pendingWait -> Pending (0) --------
//   {
//     campaignId: "pw_01",
//     campaignName: "Pending Promo #1",
//     campaignSocialMedia: "instagram",
//     date: "2026-02-01",
//     price: 30,
//     socialAccountId: "soc_pw_01",
//     status: HistoryCampaignActionStatus.pending,
//     statusLabel: HistoryCampaignActionStatusLabel[HistoryCampaignActionStatus.pending],
//   },
//   {
//     campaignId: "pw_02",
//     campaignName: "Pending Promo #2",
//     campaignSocialMedia: "tiktok",
//     date: "2026-02-02",
//     price: 35,
//     socialAccountId: "soc_pw_02",
//     status: HistoryCampaignActionStatus.pending,
//     statusLabel: HistoryCampaignActionStatusLabel[HistoryCampaignActionStatus.pending],
//   },
//   {
//     campaignId: "pw_03",
//     campaignName: "Pending Promo #3",
//     campaignSocialMedia: "youtube",
//     date: "2026-02-03",
//     price: 40,
//     socialAccountId: "soc_pw_03",
//     status: HistoryCampaignActionStatus.pending,
//     statusLabel: HistoryCampaignActionStatusLabel[HistoryCampaignActionStatus.pending],
//   },
//   {
//     campaignId: "pw_04",
//     campaignName: "Pending Promo #4",
//     campaignSocialMedia: "spotify",
//     date: "2026-02-04",
//     price: 45,
//     socialAccountId: "soc_pw_04",
//     status: HistoryCampaignActionStatus.pending,
//     statusLabel: HistoryCampaignActionStatusLabel[HistoryCampaignActionStatus.pending],
//   },
//   {
//     campaignId: "pw_05",
//     campaignName: "Pending Promo #5",
//     campaignSocialMedia: "facebook",
//     date: "2026-02-05",
//     price: 50,
//     socialAccountId: "soc_pw_05",
//     status: HistoryCampaignActionStatus.pending,
//     statusLabel: HistoryCampaignActionStatusLabel[HistoryCampaignActionStatus.pending],
//   },
//   {
//     campaignId: "pw_06",
//     campaignName: "Pending Promo #6",
//     campaignSocialMedia: "press",
//     date: "2026-02-06",
//     price: 55,
//     socialAccountId: "soc_pw_06",
//     status: HistoryCampaignActionStatus.pending,
//     statusLabel: HistoryCampaignActionStatusLabel[HistoryCampaignActionStatus.pending],
//   },
//   {
//     campaignId: "pw_07",
//     campaignName: "Pending Promo #7",
//     campaignSocialMedia: "soundcloud",
//     date: "2026-02-07",
//     price: 60,
//     socialAccountId: "soc_pw_07",
//     status: HistoryCampaignActionStatus.pending,
//     statusLabel: HistoryCampaignActionStatusLabel[HistoryCampaignActionStatus.pending],
//   },
//   {
//     campaignId: "pw_08",
//     campaignName: "Pending Promo #8",
//     campaignSocialMedia: "instagram",
//     date: "2026-02-08",
//     price: 65,
//     socialAccountId: "soc_pw_08",
//     status: HistoryCampaignActionStatus.pending,
//     statusLabel: HistoryCampaignActionStatusLabel[HistoryCampaignActionStatus.pending],
//   },
//   {
//     campaignId: "pw_09",
//     campaignName: "Pending Promo #9",
//     campaignSocialMedia: "tiktok",
//     date: "2026-02-09",
//     price: 70,
//     socialAccountId: "soc_pw_09",
//     status: HistoryCampaignActionStatus.pending,
//     statusLabel: HistoryCampaignActionStatusLabel[HistoryCampaignActionStatus.pending],
//   },
//   {
//     campaignId: "pw_10",
//     campaignName: "Pending Promo #10",
//     campaignSocialMedia: "youtube",
//     date: "2026-02-10",
//     price: 75,
//     socialAccountId: "soc_pw_10",
//     status: HistoryCampaignActionStatus.pending,
//     statusLabel: HistoryCampaignActionStatusLabel[HistoryCampaignActionStatus.pending],
//   },
//
//   // -------- ongoingAccept -> In Distribution (1) --------
//   {
//     campaignId: "oa_01",
//     campaignName: "Ongoing Promo #1",
//     campaignSocialMedia: "instagram",
//     date: "2026-01-15",
//     price: 50,
//     socialAccountId: "soc_oa_01",
//     status: HistoryCampaignActionStatus.inDistribution,
//     statusLabel: HistoryCampaignActionStatusLabel[HistoryCampaignActionStatus.inDistribution],
//   },
//   {
//     campaignId: "oa_02",
//     campaignName: "Ongoing Promo #2",
//     campaignSocialMedia: "tiktok",
//     date: "2026-01-16",
//     price: 55,
//     socialAccountId: "soc_oa_02",
//     status: HistoryCampaignActionStatus.inDistribution,
//     statusLabel: HistoryCampaignActionStatusLabel[HistoryCampaignActionStatus.inDistribution],
//   },
//   {
//     campaignId: "oa_03",
//     campaignName: "Ongoing Promo #3",
//     campaignSocialMedia: "youtube",
//     date: "2026-01-17",
//     price: 60,
//     socialAccountId: "soc_oa_03",
//     status: HistoryCampaignActionStatus.inDistribution,
//     statusLabel: HistoryCampaignActionStatusLabel[HistoryCampaignActionStatus.inDistribution],
//   },
//   {
//     campaignId: "oa_04",
//     campaignName: "Ongoing Promo #4",
//     campaignSocialMedia: "facebook",
//     date: "2026-01-18",
//     price: 65,
//     socialAccountId: "soc_oa_04",
//     status: HistoryCampaignActionStatus.inDistribution,
//     statusLabel: HistoryCampaignActionStatusLabel[HistoryCampaignActionStatus.inDistribution],
//   },
//   {
//     campaignId: "oa_05",
//     campaignName: "Ongoing Promo #5",
//     campaignSocialMedia: "spotify",
//     date: "2026-01-19",
//     price: 70,
//     socialAccountId: "soc_oa_05",
//     status: HistoryCampaignActionStatus.inDistribution,
//     statusLabel: HistoryCampaignActionStatusLabel[HistoryCampaignActionStatus.inDistribution],
//   },
//   {
//     campaignId: "oa_06",
//     campaignName: "Ongoing Promo #6",
//     campaignSocialMedia: "press",
//     date: "2026-01-20",
//     price: 75,
//     socialAccountId: "soc_oa_06",
//     status: HistoryCampaignActionStatus.inDistribution,
//     statusLabel: HistoryCampaignActionStatusLabel[HistoryCampaignActionStatus.inDistribution],
//   },
//   {
//     campaignId: "oa_07",
//     campaignName: "Ongoing Promo #7",
//     campaignSocialMedia: "soundcloud",
//     date: "2026-01-21",
//     price: 80,
//     socialAccountId: "soc_oa_07",
//     status: HistoryCampaignActionStatus.inDistribution,
//     statusLabel: HistoryCampaignActionStatusLabel[HistoryCampaignActionStatus.inDistribution],
//   },
//   {
//     campaignId: "oa_08",
//     campaignName: "Ongoing Promo #8",
//     campaignSocialMedia: "instagram",
//     date: "2026-01-22",
//     price: 85,
//     socialAccountId: "soc_oa_08",
//     status: HistoryCampaignActionStatus.inDistribution,
//     statusLabel: HistoryCampaignActionStatusLabel[HistoryCampaignActionStatus.inDistribution],
//   },
//   {
//     campaignId: "oa_09",
//     campaignName: "Ongoing Promo #9",
//     campaignSocialMedia: "tiktok",
//     date: "2026-01-23",
//     price: 90,
//     socialAccountId: "soc_oa_09",
//     status: HistoryCampaignActionStatus.inDistribution,
//     statusLabel: HistoryCampaignActionStatusLabel[HistoryCampaignActionStatus.inDistribution],
//   },
//   {
//     campaignId: "oa_10",
//     campaignName: "Ongoing Promo #10",
//     campaignSocialMedia: "youtube",
//     date: "2026-01-24",
//     price: 95,
//     socialAccountId: "soc_oa_10",
//     status: HistoryCampaignActionStatus.inDistribution,
//     statusLabel: HistoryCampaignActionStatusLabel[HistoryCampaignActionStatus.inDistribution],
//   },
//
//   // -------- completedClose -> mix (2/3/4) --------
//   {
//     campaignId: "cc_01",
//     campaignName: "Completed Promo #1",
//     campaignSocialMedia: "instagram",
//     date: "2025-12-10",
//     price: 60,
//     socialAccountId: "soc_cc_01",
//     status: HistoryCampaignActionStatus.insightsSubmitted,
//     statusLabel: HistoryCampaignActionStatusLabel[HistoryCampaignActionStatus.insightsSubmitted],
//   },
//   {
//     campaignId: "cc_02",
//     campaignName: "Completed Promo #2",
//     campaignSocialMedia: "youtube",
//     date: "2025-12-11",
//     price: 70,
//     socialAccountId: "soc_cc_02",
//     status: HistoryCampaignActionStatus.invoiceSubmitted,
//     statusLabel: HistoryCampaignActionStatusLabel[HistoryCampaignActionStatus.invoiceSubmitted],
//   },
//   {
//     campaignId: "cc_03",
//     campaignName: "Completed Promo #3",
//     campaignSocialMedia: "press",
//     date: "2025-12-12",
//     price: 80,
//     socialAccountId: "soc_cc_03",
//     status: HistoryCampaignActionStatus.paid,
//     statusLabel: HistoryCampaignActionStatusLabel[HistoryCampaignActionStatus.paid],
//   },
//   {
//     campaignId: "cc_04",
//     campaignName: "Completed Promo #4",
//     campaignSocialMedia: "soundcloud",
//     date: "2025-12-13",
//     price: 65,
//     socialAccountId: "soc_cc_04",
//     status: HistoryCampaignActionStatus.insightsSubmitted,
//     statusLabel: HistoryCampaignActionStatusLabel[HistoryCampaignActionStatus.insightsSubmitted],
//   },
//   {
//     campaignId: "cc_05",
//     campaignName: "Completed Promo #5",
//     campaignSocialMedia: "spotify",
//     date: "2025-12-14",
//     price: 90,
//     socialAccountId: "soc_cc_05",
//     status: HistoryCampaignActionStatus.invoiceSubmitted,
//     statusLabel: HistoryCampaignActionStatusLabel[HistoryCampaignActionStatus.invoiceSubmitted],
//   },
//   {
//     campaignId: "cc_06",
//     campaignName: "Completed Promo #6",
//     campaignSocialMedia: "facebook",
//     date: "2025-12-15",
//     price: 55,
//     socialAccountId: "soc_cc_06",
//     status: HistoryCampaignActionStatus.paid,
//     statusLabel: HistoryCampaignActionStatusLabel[HistoryCampaignActionStatus.paid],
//   },
//   {
//     campaignId: "cc_07",
//     campaignName: "Completed Promo #7",
//     campaignSocialMedia: "instagram",
//     date: "2025-12-16",
//     price: 100,
//     socialAccountId: "soc_cc_07",
//     status: HistoryCampaignActionStatus.insightsSubmitted,
//     statusLabel: HistoryCampaignActionStatusLabel[HistoryCampaignActionStatus.insightsSubmitted],
//   },
//   {
//     campaignId: "cc_08",
//     campaignName: "Completed Promo #8",
//     campaignSocialMedia: "youtube",
//     date: "2025-12-17",
//     price: 85,
//     socialAccountId: "soc_cc_08",
//     status: HistoryCampaignActionStatus.invoiceSubmitted,
//     statusLabel: HistoryCampaignActionStatusLabel[HistoryCampaignActionStatus.invoiceSubmitted],
//   },
//   {
//     campaignId: "cc_09",
//     campaignName: "Completed Promo #9",
//     campaignSocialMedia: "press",
//     date: "2025-12-18",
//     price: 120,
//     socialAccountId: "soc_cc_09",
//     status: HistoryCampaignActionStatus.paid,
//     statusLabel: HistoryCampaignActionStatusLabel[HistoryCampaignActionStatus.paid],
//   },
//   {
//     campaignId: "cc_10",
//     campaignName: "Completed Promo #10",
//     campaignSocialMedia: "soundcloud",
//     date: "2025-12-19",
//     price: 75,
//     socialAccountId: "soc_cc_10",
//     status: HistoryCampaignActionStatus.insightsSubmitted,
//     statusLabel: HistoryCampaignActionStatusLabel[HistoryCampaignActionStatus.insightsSubmitted],
//   },
//
//   // -------- declined -> Denied (5) --------
//   {
//     campaignId: "dc_01",
//     campaignName: "Declined Promo #1",
//     campaignSocialMedia: "instagram",
//     date: "2026-01-05",
//     price: 40,
//     socialAccountId: "soc_dc_01",
//     status: HistoryCampaignActionStatus.denied,
//     statusLabel: HistoryCampaignActionStatusLabel[HistoryCampaignActionStatus.denied],
//   },
//   {
//     campaignId: "dc_02",
//     campaignName: "Declined Promo #2",
//     campaignSocialMedia: "tiktok",
//     date: "2026-01-06",
//     price: 45,
//     socialAccountId: "soc_dc_02",
//     status: HistoryCampaignActionStatus.denied,
//     statusLabel: HistoryCampaignActionStatusLabel[HistoryCampaignActionStatus.denied],
//   },
//   {
//     campaignId: "dc_03",
//     campaignName: "Declined Promo #3",
//     campaignSocialMedia: "youtube",
//     date: "2026-01-07",
//     price: 50,
//     socialAccountId: "soc_dc_03",
//     status: HistoryCampaignActionStatus.denied,
//     statusLabel: HistoryCampaignActionStatusLabel[HistoryCampaignActionStatus.denied],
//   },
//   {
//     campaignId: "dc_04",
//     campaignName: "Declined Promo #4",
//     campaignSocialMedia: "multipromo",
//     date: "2026-01-08",
//     price: 55,
//     socialAccountId: "soc_dc_04",
//     status: HistoryCampaignActionStatus.denied,
//     statusLabel: HistoryCampaignActionStatusLabel[HistoryCampaignActionStatus.denied],
//   },
//   {
//     campaignId: "dc_05",
//     campaignName: "Declined Promo #5",
//     campaignSocialMedia: "instagram",
//     date: "2026-01-09",
//     price: 60,
//     socialAccountId: "soc_dc_05",
//     status: HistoryCampaignActionStatus.denied,
//     statusLabel: HistoryCampaignActionStatusLabel[HistoryCampaignActionStatus.denied],
//   },
//   {
//     campaignId: "dc_06",
//     campaignName: "Declined Promo #6",
//     campaignSocialMedia: "tiktok",
//     date: "2026-01-10",
//     price: 65,
//     socialAccountId: "soc_dc_06",
//     status: HistoryCampaignActionStatus.denied,
//     statusLabel: HistoryCampaignActionStatusLabel[HistoryCampaignActionStatus.denied],
//   },
//   {
//     campaignId: "dc_07",
//     campaignName: "Declined Promo #7",
//     campaignSocialMedia: "youtube",
//     date: "2026-01-11",
//     price: 70,
//     socialAccountId: "soc_dc_07",
//     status: HistoryCampaignActionStatus.denied,
//     statusLabel: HistoryCampaignActionStatusLabel[HistoryCampaignActionStatus.denied],
//   },
//   {
//     campaignId: "dc_08",
//     campaignName: "Declined Promo #8",
//     campaignSocialMedia: "multipromo",
//     date: "2026-01-12",
//     price: 75,
//     socialAccountId: "soc_dc_08",
//     status: HistoryCampaignActionStatus.denied,
//     statusLabel: HistoryCampaignActionStatusLabel[HistoryCampaignActionStatus.denied],
//   },
//   {
//     campaignId: "dc_09",
//     campaignName: "Declined Promo #9",
//     campaignSocialMedia: "instagram",
//     date: "2026-01-13",
//     price: 80,
//     socialAccountId: "soc_dc_09",
//     status: HistoryCampaignActionStatus.denied,
//     statusLabel: HistoryCampaignActionStatusLabel[HistoryCampaignActionStatus.denied],
//   },
//   {
//     campaignId: "dc_10",
//     campaignName: "Declined Promo #10",
//     campaignSocialMedia: "tiktok",
//     date: "2026-01-14",
//     price: 85,
//     socialAccountId: "soc_dc_10",
//     status: HistoryCampaignActionStatus.denied,
//     statusLabel: HistoryCampaignActionStatusLabel[HistoryCampaignActionStatus.denied],
//   },
// ];
