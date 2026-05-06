import type {
    CampaignFilterItem,
    CampaignFilterMethod,
    CampaignFilterSection,
} from "../model/campaign-filter.types";
import type {
    CampaignFilterItemDto,
    CampaignFilterSectionDto,
} from "../api/campaign-filter.dto";

const mapMethod = (value: string): CampaignFilterMethod | null => {
    const normalized = value.toLowerCase();

    if (normalized === "and") return "and";
    if (normalized === "or") return "or";

    return null;
};

const toSafeFilterId = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[()]/g, "")
        .replace(/,/g, "-")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

export const mapCampaignFilterItemDto = (
    dto: CampaignFilterItemDto,
): CampaignFilterItem => {
    const raw = String(dto.id ?? "");

    return {
        id: toSafeFilterId(raw),
        rawId: raw,
        apiValue: raw,
        group: String(dto.group ?? ""),
        filterName: String(dto.filterName ?? ""),
        count: Number(dto.count ?? 0),
        children: dto.children?.map(mapCampaignFilterItemDto),
    };
};

export const mapCampaignFilterSectionDto = (
    dto: CampaignFilterSectionDto,
): CampaignFilterSection => ({
    id: String(dto.id),
    title: String(dto.title),
    methods: (dto.AndOrFlag ?? [])
        .map((item) => mapMethod(item.method))
        .filter(Boolean) as CampaignFilterMethod[],
    filters: (dto.filters ?? []).map(mapCampaignFilterItemDto),
});