import type { CampaignPaymentDetails, CreateRegularCampaignRequest } from "@/api/client/campaign/create-campaign.types";
import type { CreateCampaignProposalRequest } from "@/entities/client-side/campaign-strategy-page/api/save-proposal";
import { assertSupportedSelections, currencyCode, getDraftRowIds, serializeDraftSelection, serializeSelectedOffer, type SelectedOffer } from "./selected-offer";
import type { CampaignContentItem, SelectedCampaignAccount } from "./campaign-builder.types";
import { serializeCampaignContent, serializeContentReference } from "./campaign-content.transport";

type BuildStrategyBaseParams = {
    campaignName: string;
    totalPrice?: number;
    draftId?: string | null;
    accounts: any[];
    content: any[];
    displayCurrency?: string;
};

const mapAccountsForStrategy = (accounts: any[], content: any[]) =>
    accounts.map((account) => ({
        socialAccountId: String(account.accountId ?? ""),
        influencerId: String(account.influencerId ?? ""),
        socialMedia: String(account.socialMedia ?? ""),
        username: String(account.username ?? ""),
        selectedCampaignContentItem: serializeContentReference(account.selectedCampaignContentItem, content) ?? undefined,
        dateRequest: String(account.dateRequest ?? "ASAP"),
        profileType: String(account.profileType ?? "community"),
    }));

const mapContentForStrategy = serializeCampaignContent;

const resolveStrategySocialMedia = (items: any[]) => {
    const socials = Array.from(
        new Set(
            items
                .map((item) => String(item.socialMedia ?? "").trim().toLowerCase())
                .filter(Boolean),
        ),
    );

    if (socials.length === 0) return "instagram";
    if (socials.length === 1) return socials[0];

    return "multipromo";
};

export const buildStrategyDraftPayload = ({
                                              campaignName,
                                              draftId,
                                              accounts,
                                              content,
                                              selectedOffer = null,
                                              displayCurrency = "EUR",
                                          }: BuildStrategyBaseParams & { selectedOffer?: SelectedOffer | null }) => {
    assertSupportedSelections(accounts);
    const campaignContent = mapContentForStrategy(content);
    return {
    ...(draftId ? { draftId } : {}),
    step: "strategyTable",
    displayCurrency: currencyCode(displayCurrency),
    campaignName: String(campaignName ?? ""),
    socialMedia: resolveStrategySocialMedia(content),
    ...serializeDraftSelection(mapAccountsForStrategy(accounts, campaignContent).map((row, index) => ({
        ...row,
        ...getDraftRowIds(accounts[index]),
    })), selectedOffer),
    campaignContent,
    };
};

export const buildStrategyProposalPayload = ({
                                                 campaignName,
                                                 totalPrice,
                                                 accounts,
                                                 content,
                                                 displayCurrency,
                                             }: Omit<BuildStrategyBaseParams, "displayCurrency" | "totalPrice" | "accounts" | "content"> & {
    displayCurrency: string;
    totalPrice: number;
    accounts: SelectedCampaignAccount[];
    content: CampaignContentItem[];
                                             }): CreateCampaignProposalRequest => {
    // currencyCode has an EUR fallback for older callers. Never use it to hide an invalid proposal currency.
    if (!["EUR", "USD", "GBP", "€", "$", "£"].includes(displayCurrency)) {
        throw new Error("Choose EUR, USD or GBP before saving the proposal.");
    }
    if (!Number.isFinite(totalPrice) || totalPrice < 0) {
        throw new Error("Prices are unavailable for the selected currency. Review the selection before saving the proposal.");
    }
    const campaignContent = mapContentForStrategy(content);
    return {
    campaignName: String(campaignName ?? ""),
    socialMedia: resolveStrategySocialMedia(content),
    campaignPrice: totalPrice,
    displayCurrency: currencyCode(displayCurrency),
    addedAccounts: mapAccountsForStrategy(accounts, campaignContent),
    campaignContent,
    };
};

export const buildStrategyCreateCampaignPayload = ({
                                                       campaignName,
                                                       totalPrice,
                                                       accounts,
                                                       content,
                                                       paymentDetails,
                                                       selectedOffer = null,
                                                       offerIsAvailable,
                                                       displayCurrency = "EUR",
                                                   }: Omit<BuildStrategyBaseParams, "accounts" | "content"> & {
    accounts: SelectedCampaignAccount[];
    content: CampaignContentItem[];
    paymentDetails: CampaignPaymentDetails;
    selectedOffer?: SelectedOffer | null;
    offerIsAvailable?: boolean | null;
                                                   }): CreateRegularCampaignRequest => {
    assertSupportedSelections(accounts);
    const campaignContent = mapContentForStrategy(content);
    const addedAccounts = mapAccountsForStrategy(accounts, campaignContent);
    return {
    campaignName: String(campaignName ?? ""),
    socialMedia: resolveStrategySocialMedia(content),
    campaignPrice: Number(totalPrice ?? 0),
    displayCurrency: currencyCode(displayCurrency),
    addedAccounts,
    selectedOffer: serializeSelectedOffer(selectedOffer, addedAccounts, offerIsAvailable),
    campaignContent,
    paymentDetails,
    };
};
