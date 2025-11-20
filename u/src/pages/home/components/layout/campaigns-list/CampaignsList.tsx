import type {FC} from "react";
import type {ListDisplayMode} from "../../../../../types/utils/constants.types.ts";
import type {CampaignForList} from "../../../../../types/campaign.types.ts";
import {getSocialMediaIcon} from "../../../../../utils/constants/social-medias.ts";
import './_campaigns_list.scss';

export interface CampaignsListProps {
    listDisplayMode: ListDisplayMode;
    list: CampaignForList[];
}

export const CampaignsList: FC<CampaignsListProps> = ({listDisplayMode, list}: CampaignsListProps) => {
    return (
        <div className='home-campaigns-grid'>
            {list?.length > 0 && list.map((item) => (
                <div key={item._id} className='home-campaigns-grid__item'>
                    <div className='home-campaigns-grid__item-header'>
                        <div className='home-campaigns-grid__item-info'>
                            <div className='home-campaigns-grid__item-meta'>
                                <img src={getSocialMediaIcon(item.socialMedia)} alt=''/>
                                <p>{item.status}</p>
                            </div>
                            <div className='home-campaigns-grid__item-date'>
                                <p>{item.creationDate}</p>
                            </div>
                        </div>
                        <div className='home-campaigns-grid__item-price'>
                            <p>{item.price}€</p>
                        </div>
                    </div>
                    <div className='home-campaigns-grid__item-title'>
                        <p>{item.campaignName}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}