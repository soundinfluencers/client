import { calcGroupPrices } from "@/client-side/utils";
import type {
    CampaignContentConfig,
    CampaignContentKind,
    CampaignContentResolved,
} from "./campaign-content.types";



const MAIN_NETWORKS = ["facebook", "instagram", "youtube", "tiktok"];
const MUSIC_NETWORKS = ["spotify", "soundcloud"];

export const getGroupBySocial = (
    socialMedia?: string,
): "main" | "music" | "press" => {
    const sm = String(socialMedia ?? "").toLowerCase();

    if (MAIN_NETWORKS.includes(sm)) return "main";
    if (MUSIC_NETWORKS.includes(sm)) return "music";
    return "press";
};
export function applyPatches<T extends { _id: string }>(
    base: T[],
    patches: Record<string, any>,
): T[] {
    if (!base?.length) return base ?? [];

    return base.map((item) => {
        const patch = patches[item._id];
        return patch ? ({ ...item, ...patch } as T) : item;
    });
}
export const ensureContentGroupsFromAccounts = (
    accounts: any[] = [],
    content: any[] = [],
) => {
    const next = [...(content ?? [])];

    const existingGroups = new Set(
        next.map((item) => String(item?.socialMediaGroup ?? "")),
    );

    const accountGroups = Array.from(
        new Set(
            (accounts ?? []).map((acc) =>
                getGroupBySocial(String(acc?.socialMedia ?? "")),
            ),
        ),
    );

    accountGroups.forEach((group) => {
        if (existingGroups.has(group)) return;

        const firstAccountForGroup = (accounts ?? []).find(
            (acc) => getGroupBySocial(String(acc?.socialMedia ?? "")) === group,
        );

        next.push({
            _id: `virtual-${group}`,
            socialMedia: String(firstAccountForGroup?.socialMedia ?? "").toLowerCase(),
            socialMediaGroup: group,
            mainLink: "",
            descriptions: [],
            taggedUser: "",
            taggedLink: "",
            additionalBrief: "",
        });
    });

    return next;
};
export const groupCampaignContent = (content: any[]) => ({
    main: content.filter((x) => x.socialMediaGroup === "main"),
    music: content.filter((x) => x.socialMediaGroup === "music"),
    press: content.filter((x) => x.socialMediaGroup === "press"),
});

export const getCampaignContentConfig = (
    kind: CampaignContentKind,
    campaign: any,
    view: number,
    flag: boolean,
) => {
    if (kind === "proposal") {
        return {
            kind,
            canEdit: (view === -1 || view === 2) && !!campaign?.selectedOption?.canEdit,
            showInsightsInsteadOfStrategy: false,
            showProposalAddInfluencer: true,
            useChangeViewColumns: true,
            tableComponent: "proposal",
            liveCanEdit: !!campaign?.selectedOption?.canEdit,
        };
    }

    if (kind === "regular") {
        return {
            kind,
            canEdit: !!campaign?.canEdit,
            showInsightsInsteadOfStrategy: !flag,
            showProposalAddInfluencer: false,
            useChangeViewColumns: false,
            tableComponent: "strategy",
            liveCanEdit: false,
        };
    }

    return {
        kind,
        canEdit: true,
        showInsightsInsteadOfStrategy: false,
        showProposalAddInfluencer: false,
        useChangeViewColumns: true,
        tableComponent: "draft",
        liveCanEdit: true,
    };
};

export const resolveCampaignId = (campaign: any): string => {
    if (campaign?.kind === "proposal") {
        return String(campaign?.campaignId ?? "");
    }

    if (campaign?.kind === "regular") {
        return String(campaign?.campaignId ?? "");
    }

    return String(campaign?.draftId ?? "");
};

export const buildResolvedCampaignContent = ({
                                                 kind,
                                                 campaign,
                                                 accounts,
                                                 content,
                                                 view,
                                                 flag,
                                             }: {
    kind: CampaignContentKind;
    campaign: any;
    accounts: any[];
    content: any[];
    view: number;
    flag: boolean;
}): CampaignContentResolved => {
    const { groupPrices } = calcGroupPrices(accounts);
    const byGroup = groupCampaignContent(content);
    const config = getCampaignContentConfig(kind, campaign, view, flag);

    return {
        kind,
        campaignId: resolveCampaignId(campaign),
        accounts,
        content,
        byGroup,
        groupPrices,
        config,
    };
};

export const getAccountSelectedContentId = (account: any) => {
    return String(
        account?.selectedContent?.campaignContentItemId ??
        account?.selectedCampaignContentItem?.campaignContentItemId ??
        account?.selectedContentItem?._id ??
        "",
    );
};

export const getAccountsByContentId = (accounts: any[]) => {
    return (accounts ?? []).reduce<Record<string, any[]>>((acc, account) => {
        const contentId = getAccountSelectedContentId(account);

        if (!contentId) return acc;

        if (!acc[contentId]) {
            acc[contentId] = [];
        }

        acc[contentId].push(account);

        return acc;
    }, {});
};

export const filterContentWithAccounts = ({
                                              content,
                                              accountsByContentId,
                                          }: {
    content: any[];
    accountsByContentId: Record<string, any[]>;
}) => {
    return (content ?? []).filter((item) => {
        const contentId = String(item?._id ?? "");
        return (accountsByContentId[contentId] ?? []).length > 0;
    });
};