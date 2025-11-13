import type {FC} from "react";
import './_client-company-select.scss';
import {type ClientCompanyType, clientCompanyTypes} from "../../../../../../types/user/user.types.ts";
import openMenu from "@/assets/icons/chevron-down.svg";
import check from "@/assets/icons/check.svg";

export interface CompanySelectProps {
    selectedType: ClientCompanyType;
    selectType: (value: ClientCompanyType) => void;
    isMenuOpen: boolean;
    setIsMenuOpen: (isOpen: boolean) => void;
}

export const ClientCompanySelect: FC<CompanySelectProps> = ({selectedType, selectType, isMenuOpen, setIsMenuOpen}: CompanySelectProps) => {
    return (
        <div className='client-company-select'>
            <p className='client-company-select__title'>Company Type</p>

            <div className='client-company-select__main' onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {selectedType ?
                    <p className='client-company-select__selected-type'>{selectedType}</p> :
                    <p className='client-company-select__placeholder'>Choose company type</p>}
                <img src={openMenu} alt=''/>
            </div>

            <div className={`client-company-select__dropdown ${isMenuOpen ? 'client-company-select__dropdown--visible' : ''}`}>
                <div className='client-company-select__dropdown-list'>
                    {clientCompanyTypes.map((companyType) => (
                        <div key={companyType} className='client-company-select__dropdown-list-item' onClick={() => selectType(companyType)}>
                            <p>{companyType}</p>
                            {selectedType === companyType ? <img src={check} alt=''/> : ''}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}