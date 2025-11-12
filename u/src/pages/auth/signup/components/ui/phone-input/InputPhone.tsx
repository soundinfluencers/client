import {type ChangeEvent, type FC, useEffect, useState} from "react";
import './_input-phone.scss';
import openMenu from "@/assets/icons/chevron-down.svg";
import {validatePhoneNumber} from "../../../../../../utils/validators/validators.ts";
import type {PhoneNumberType} from "../../../../../../types/utils/constants.types.ts";

export interface InputPhoneProps {
    value: string;
    setValue: (value: string) => void;
    isError?: boolean;
}

export const InputPhone: FC<InputPhoneProps> = ({value, setValue, isError}: InputPhoneProps) => {
    const [isValid, setIsValid] = useState(true);
    const [selectedPhoneDetails, setSelectedPhoneDetails] = useState<PhoneNumberType>({
        countryName: 'Great Britain',
        placeholder: '+44',
        pattern: 'xz',
        countryFlag: '🇬🇧'
    })

    useEffect(() => {
        if (!value) {
            setIsValid(true);
            return;
        }

        const handler = setTimeout(() => {
            const valid = validatePhoneNumber(value);
            console.log(valid, 'valid')
        }, 500);

        return () => clearTimeout(handler);
    }, [value]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    };

    return (
        <div className={`input-phone ${!isValid || isError ? 'error' : ''}`}>
            <p className='input-phone__title'>Phone</p>

            <div className="input-phone__input-block">
                <div className="input-phone__menu-btn">
                    <p className='input-phone__flag'>🇬🇧</p>
                    <img src={openMenu} alt='' className="input-phone__open-menu-btn"/>
                </div>
                <input
                    className="input-phone__input"
                    type="text"
                    value={value}
                    onChange={handleChange}
                    placeholder='+44'
                />
            </div>

            {!isValid && <p className="input-phone__error">Invalid phone number</p>}
        </div>
    );
};
