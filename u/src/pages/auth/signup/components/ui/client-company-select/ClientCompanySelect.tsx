import {type FC, useRef} from "react";
import './_client-company-select.scss';
import {type ClientCompanyType, clientCompanyTypes} from "../../../../../../types/user/user.types.ts";
import openMenu from "@/assets/icons/chevron-down.svg";
import check from "@/assets/icons/check.svg";
import {useClickOutside} from "../../../../../../hooks/useClickOutside.ts";

export interface CompanySelectProps {
    selectedType: ClientCompanyType;
    selectType: (value: ClientCompanyType) => void;
    isMenuOpen: boolean;
    setIsMenuOpen: (isOpen: boolean) => void;
}

export const ClientCompanySelect: FC<CompanySelectProps> = ({selectedType, selectType, isMenuOpen, setIsMenuOpen}: CompanySelectProps) => {
    const dropdownRef = useRef<HTMLDivElement>(null);

    useClickOutside(dropdownRef, () => {
        if (isMenuOpen) setIsMenuOpen(false);
    })

    return (
        <div className='client-company-select' ref={dropdownRef}>
            <p className='client-company-select__title'>Company Type</p>

            <div className={`client-company-select__main ${isMenuOpen ? 'client-company-select__main--active' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
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