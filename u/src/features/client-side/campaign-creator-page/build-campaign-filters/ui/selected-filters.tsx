import x from "@/assets/icons/x.svg";
import type {
    CampaignFilterItem
} from "@/entities/client-side/campaign-creator-page/campaign-filter/model/campaign-filter.types.ts";

type Props = {
    selected: CampaignFilterItem[];
    onRemove: (id: string) => void;
};

export const SelectedFilters = ({ selected, onRemove }: Props) => {
    return (
        <ul>
            {selected.map((item) => {
                const selectedSocialCount = selected.filter(
                    (filter) => filter.group === "socialMedia",
                ).length;

                const hideRemoveButton =
                    item.group === "socialMedia" && selectedSocialCount <= 1;

                return (
                    <li key={item.id}>
                        {item.filterName}
                        {!hideRemoveButton && (
                            <img onClick={() => onRemove(item.id)} src={x} alt="" />
                        )}
                    </li>
                );
            })}
        </ul>
    );
};