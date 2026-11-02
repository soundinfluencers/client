// Wire projections of promos.service@439b56d. Display fields are optional: they
// are not identities or permissions, and older/incomplete records can omit them.
export type PromoPlatform = 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'spotify' | 'press' | 'soundcloud' | 'multipromo';
export type PromoReadStatus = 'new' | 'ongoing' | 'close';
export interface PlacementIdentity { campaignId: string; addedAccountsId: string }
export interface PromoDisplay {
  campaignName?: string; username?: string; accountSocialMedia?: string;
  socialAccountId?: string | null; influencerId?: string;
  logoUrl?: string | null; createdAt?: string; clientName?: string;
  isPaused?: boolean; statusCampaign?: string; confirmation?: 'accept' | 'decline' | 'wait'; closedStatus?: 'close' | 'wait';
  bundleId?: string; campaignBundleId?: string; bundlePosition?: number;
}
export interface PromoBrief {
  dateRequest?: string | null; mainLink?: string | null; description?: string | null;
  taggedUser?: string | null; taggedLink?: string | null; additionalBrief?: string | null;
}
export interface DashboardPlacementDto extends PlacementIdentity {
  campaignName?: string; socialMedia?: string; reward?: number | null;
  createdAt?: string; source?: string; isPaused?: boolean;
  statusCampaign?: string; confirmation?: 'accept' | 'decline' | 'wait'; closedStatus?: 'close' | 'wait';
  bundleId?: string; campaignBundleId?: string;
}
export interface DashboardStandaloneDto extends DashboardPlacementDto { type: 'standalone' }
export interface DashboardBundleDto {
  type: 'bundle'; bundleId: string; reward?: number | null; promos: DashboardPlacementDto[];
  // Not currently projected; preserve it if the contract is extended.
  campaignBundleId?: string; isPaused?: boolean;
}
export type DashboardPromo = DashboardStandaloneDto | DashboardBundleDto;
export interface NewStandaloneDto extends PlacementIdentity, PromoDisplay, PromoBrief { promoType: 'standalone' }
export interface NewBundleAccountDto extends PromoBrief {
  addedAccountsId: string; socialAccountId?: string | null; username?: string;
  logoUrl?: string | null; accountSocialMedia?: string; followers?: number;
  reward?: number | null; bundlePosition?: number; isAddedToCampaign?: boolean;
}
export interface NewBundleDto {
  promoType: 'bundle'; campaignId: string; campaignBundleId: string; bundleId: string;
  influencerId?: string; campaignName?: string; clientName?: string; createdAt?: string;
  isPaused?: boolean; acceptancePolicy?: string; currency?: string;
  originalReward?: number | null; bundleReward?: number | null; accounts: NewBundleAccountDto[];
}
export interface OngoingListDto extends PlacementIdentity, PromoDisplay, PromoBrief {
  reward?: number | null; postLink?: string | null;
}
export interface OngoingPinnedDto extends OngoingListDto {
  influencerId: string; statusCampaign: string; confirmation: 'accept' | 'decline' | 'wait'; closedStatus: 'close' | 'wait';
}
export interface CompletedListDto extends PlacementIdentity, PromoDisplay { reward?: number | null; postLink?: string | null }
export interface CompletedPinnedDto extends CompletedListDto {}
// Internal read discriminator only; never serialized as status or membership.
export type NewStandalonePromo = NewStandaloneDto & { readKind: 'new' };
export type NewBundlePromo = NewBundleDto & { readKind: 'new' };
export type OngoingPromo = OngoingListDto & { readKind: 'ongoing' };
export type CompletedPromo = CompletedListDto & { readKind: 'close' };
export type PlacementPromo = NewStandalonePromo | OngoingPromo | CompletedPromo;
export type DetailedPromo = PlacementPromo | NewBundlePromo;
export interface PromoPage<T> { items: T[]; baseCount: number }
export interface BundleDecisionDto {
  campaignId: string; campaignBundleId: string;
  selectedAddedAccountsIds: string[]; campaignResponse: 'accept' | 'decline';
}
