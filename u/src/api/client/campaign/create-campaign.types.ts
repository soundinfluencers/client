import type { DisplayCurrency, SelectedOffer } from "@/entities/client-side/campaign-creator-page/campaign-builder/model/selected-offer";

export type CampaignPaymentDetails = {
    firstName: string;
    lastName: string;
    address: string;
    country: string;
    referenceNumber: string;
    amount: number;
    company?: string;
    vatNumber?: string;
    selectedPaymentMethod: string;
};

export type CreateRegularCampaignRequest = {
    sourceDraftId?: string;
    campaignName: string;
    socialMedia: string;
    campaignPrice: number;
    displayCurrency?: DisplayCurrency;
    addedAccounts: Array<{
        socialAccountId: string;
        influencerId: string;
        socialMedia: string;
        username?: string;
        dateRequest?: string;
        bundleId?: string;
        selectedCampaignContentItem?: { campaignContentItemId: string; descriptionId: string | null; additionalBriefId?: string | null } | null;
    }>;
    campaignContent: unknown[];
    paymentDetails: CampaignPaymentDetails;
    selectedOffer?: SelectedOffer | null;
};
