import type {FC} from "react";
import type {ListDisplayMode} from "../../../../../types/utils/constants.types.ts";

export interface CampaignsListProps {
    listDisplayMode: ListDisplayMode;
    list: any[];
}

export const CampaignsList: FC<CampaignsListProps> = ({ listDisplayMode, list }: CampaignsListProps) => {
    return (
        <div className='campaigns-list'>
            {list?.length > 0 && list.map((item) => (
                <div className='campaigns-list__item'>
                    <p>asdfdsf</p>
                </div>
            ))}
        </div>
    )
}